import { BadRequest, Forbidden } from '@feathersjs/errors'
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Patients } from '../patients/patients.schema'
import type { Records } from '../records/records.schema'
import type { User } from '../users/users.schema'
import { calcularEdad, fechaDeObjectId, formatearFecha, rangoDeObjectIds } from '../../utils/mongo-id-range'
import { suiveCatalog } from './suive.catalog'
import type { Suive, SuiveCaso, SuiveData, SuiveQuery, SuiveResumen } from './suive.schema'

export type { Suive, SuiveData, SuiveQuery }

export interface SuiveServiceOptions {
  app: Application
}

export interface SuiveParams extends Params<SuiveQuery> {
  user?: User
}

interface CatalogoCie {
  CATALOG_KEY?: unknown
  NOMBRE?: unknown
  ES_SUIVE_MORB?: unknown
  EPI_CLAVE?: unknown
}

const MAX_PACIENTES_POR_INFORME = 500
const normalizeCode = (value: unknown) => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')

const patientFromResult = (result: any): Patients | undefined =>
  result?.data?.patientsList?.[0] ?? result?.patientsList?.[0] ?? result

const recordsFromResult = (result: any): Records[] => (Array.isArray(result) ? result : result?.data ?? [])

export class SuiveService<ServiceParams extends SuiveParams = SuiveParams>
  implements ServiceInterface<Suive, SuiveData, ServiceParams>
{
  constructor(public options: SuiveServiceOptions) {}

  private async catalogoSuive(): Promise<Map<string, CatalogoCie>> {
    const db = await this.options.app.get('mongodbClient')
    const rows = await db
      .collection<CatalogoCie>('catalogo-dxcie-10')
      .find(
        { ES_SUIVE_MORB: 'SI' },
        { projection: { _id: 0, CATALOG_KEY: 1, NOMBRE: 1, ES_SUIVE_MORB: 1, EPI_CLAVE: 1 } }
      )
      .toArray()
    const catalog = new Map<string, CatalogoCie>()
    for (const row of rows) {
      const key = normalizeCode(row.CATALOG_KEY)
      if (key) catalog.set(key, row)
    }
    return catalog
  }

  async create(data: SuiveData, params?: ServiceParams): Promise<Suive> {
    if (!data.patientIds.length) throw new BadRequest('La lista de pacientes viene vacía')
    if (data.patientIds.length > MAX_PACIENTES_POR_INFORME) {
      throw new BadRequest(`Demasiados pacientes en una sola descarga (máximo ${MAX_PACIENTES_POR_INFORME})`)
    }

    const role = params?.user?.role ?? 'medico'
    if (!['admin', 'medico', 'enfermeria'].includes(role)) {
      throw new Forbidden('Tu rol no puede generar informes SUIVE')
    }

    const allowedIds =
      role === 'admin' ? undefined : new Set((params?.user?.patientsList ?? []).map((id) => String(id)))
    const rangoIds = rangoDeObjectIds(data.from, data.to)
    const catalogo = await this.catalogoSuive()
    const casos: SuiveCaso[] = []
    const omitidos: Suive['omitidos'] = []
    const avisos = new Set<string>()
    let totalPacientesRevisados = 0

    // Cada paciente se resuelve en serie para no saturar el pool de Mongo.
    for (const patientId of data.patientIds) {
      if (allowedIds && !allowedIds.has(patientId)) {
        omitidos.push({ patientId, reason: 'Fuera de tu alcance' })
        continue
      }

      try {
        const patientResult = await this.options.app
          .service('patients')
          .get(patientId, { provider: undefined, query: { skipRecords: true } } as any)
        const patient = patientFromResult(patientResult)
        if (!patient?.personalInfo) throw new Error('Paciente no encontrado')

        const recordResult = await this.options.app.service('records').find({
          provider: undefined,
          query: { patientId, ...rangoIds, $sort: { _id: 1 }, $limit: 500 }
        })
        const records = recordsFromResult(recordResult)
        totalPacientesRevisados++
        if (!records.length) {
          omitidos.push({ patientId, reason: 'Sin consultas en el periodo seleccionado' })
          continue
        }

        for (const record of records) {
          const fecha = fechaDeObjectId(record._id)
          if (!fecha) {
            avisos.add(`El registro ${String(record._id)} no tiene un ObjectId válido`)
            continue
          }

          for (const diagnosis of record.Diagnosis ?? []) {
            const cieCapturado = String(diagnosis.CIE ?? '')
            const catalogEntry = catalogo.get(normalizeCode(cieCapturado))
            if (!catalogEntry) continue

            const epiClave = Number(catalogEntry.EPI_CLAVE)
            if (!Number.isInteger(epiClave)) {
              avisos.add(
                `El código ${normalizeCode(catalogEntry.CATALOG_KEY)} está marcado SUIVE sin clave EPI numérica`
              )
              continue
            }

            const enrichment = suiveCatalog[epiClave]
            if (!enrichment) avisos.add(`La clave EPI ${epiClave} no está enriquecida por el XLSX SUIVE`)
            casos.push({
              patientId,
              recordId: String(record._id),
              fechaConsulta: formatearFecha(fecha),
              nombrePaciente: [
                patient.personalInfo.names,
                patient.personalInfo.middleName,
                patient.personalInfo.lastName
              ]
                .filter(Boolean)
                .join(' '),
              edad: calcularEdad(patient.personalInfo.birthDate, fecha),
              sexo: patient.personalInfo.sex || null,
              cieCapturado,
              epiClave,
              diagnosticoSuive:
                enrichment?.nombre || String(catalogEntry.NOMBRE ?? diagnosis.Name ?? 'Sin descripción'),
              grupo: enrichment?.grupo || 'Sin grupo en catálogo SUIVE',
              notificacionInmediata: enrichment?.notificacionInmediata ?? false,
              estudioEpidemiologico: enrichment?.estudioEpidemiologico ?? false,
              estudioBrote: enrichment?.estudioBrote ?? false
            })
          }
        }
      } catch (error: any) {
        omitidos.push({ patientId, reason: error?.message ?? 'Error desconocido' })
      }
    }

    const summary = new Map<number, SuiveResumen>()
    for (const caso of casos) {
      const current = summary.get(caso.epiClave)
      if (current) current.casos++
      else {
        summary.set(caso.epiClave, {
          epiClave: caso.epiClave,
          diagnosticoSuive: caso.diagnosticoSuive,
          grupo: caso.grupo,
          casos: 1
        })
      }
    }

    return {
      casos,
      resumen: [...summary.values()].sort((left, right) => left.epiClave - right.epiClave),
      totalCasos: casos.length,
      totalPacientesRevisados,
      omitidos,
      avisos: [...avisos]
    }
  }
}

export const getOptions = (app: Application) => ({ app })
