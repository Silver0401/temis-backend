import { BadRequest, NotFound } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import { ObjectId } from 'mongodb'

import type { Application } from '../../declarations'
import { normalizeClues } from '../../hooks/generic/scope-by-clues'
import type {
  ExternalPatientRegistrationData,
  ExternalPatientRegistrationResult
} from './external-patient-registration.schema'

export interface ExternalPatientRegistrationParams extends Params {}
export interface ExternalPatientRegistrationServiceOptions {
  app: Application
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export class ExternalPatientRegistrationService<
  ServiceParams extends ExternalPatientRegistrationParams = ExternalPatientRegistrationParams
> {
  constructor(public options: ExternalPatientRegistrationServiceOptions) {}

  async create(
    data: ExternalPatientRegistrationData,
    _params?: ServiceParams
  ): Promise<ExternalPatientRegistrationResult> {
    const db = await this.options.app.get('mongodbClient')
    const doctorId = new ObjectId(data.doctorId)
    const doctor = await db
      .collection('users')
      .findOne({ _id: doctorId }, { projection: { _id: 1, clues: 1 } })
    const doctorClues = normalizeClues(doctor?.clues)
    if (!doctor || doctorClues.length === 0) throw new NotFound('Link de registro inválido')

    const country = await db.collection('catalogo-paises').findOne({
      DESCRIPCION: { $regex: `^${escapeRegex(data.birthCountry.trim())}$`, $options: 'i' }
    })
    if (!country) throw new BadRequest('Selecciona un país de nacimiento válido')

    const isMexico = country.CATALOG_KEY === 142 || /m[eé]xico/i.test(String(country.DESCRIPCION))
    const state = data.birthState
      ? await db.collection('catalogo-ent-fed').findOne({
          $or: [
            {
              ENTIDAD_FEDERATIVA: {
                $regex: `^${escapeRegex(data.birthState.trim())}$`,
                $options: 'i'
              }
            },
            { ABREVIATURA: { $regex: `^${escapeRegex(data.birthState.trim())}$`, $options: 'i' } }
          ]
        })
      : undefined
    if (isMexico && !state) throw new BadRequest('Selecciona una entidad federativa válida')

    const affiliationText = data.derechohabiencia.trim()
    const affiliation = await db.collection('catalogo-afiliaciones').findOne({
      VIGENTE: 1,
      $or: [
        { 'DESCRIPCIÓN CORTA': { $regex: `^${escapeRegex(affiliationText)}$`, $options: 'i' } },
        { 'DESCRIPCIÓN LARGA': { $regex: `^${escapeRegex(affiliationText)}$`, $options: 'i' } }
      ]
    })
    if (!affiliation) throw new BadRequest('Selecciona una derechohabiencia válida')

    const names = data.names.trim().toUpperCase()
    const middleName = data.middleName.trim().toUpperCase()
    const lastName = data.lastName.trim().toUpperCase()
    const birthPlace = [state?.ENTIDAD_FEDERATIVA, country.DESCRIPCION].filter(Boolean).join(', ')
    const patientData = {
      LUID: `${names} ${middleName} ${lastName} ~ ${data.birthDate} ~ ${birthPlace} ~ ${data.sex}`,
      personalInfo: {
        names,
        middleName,
        lastName,
        sex: data.sex,
        birthDate: data.birthDate,
        birthPlace,
        ...(data.domicile?.trim() ? { domicile: data.domicile.trim() } : {}),
        curp: data.curp.trim().toUpperCase(),
        genre: data.genre,
        seAutodenominaAfromexicano: data.seAutodenominaAfromexicano ?? -1,
        seConsideraIndigena: data.seConsideraIndigena ?? -1,
        migrante: data.migrante ?? -1,
        paisProcedencia: data.paisProcedencia ?? -1,
        derechohabiencia: [
          {
            catalogKey: Number(affiliation.CATALOG_KEY),
            descripcion: String(affiliation['DESCRIPCIÓN CORTA'] || affiliationText)
          }
        ]
      },
      localizacion: {
        nacimiento: {
          pais: {
            id: String(country._id),
            nombre: String(country.DESCRIPCION),
            catalogKey: Number(country.CATALOG_KEY)
          },
          ...(state
            ? {
                estado: {
                  id: String(state._id),
                  nombre: String(state.ENTIDAD_FEDERATIVA),
                  catalogKey: Number(state.CATALOG_KEY)
                }
              }
            : {})
        }
      }
    }

    await this.options.app.service('patients').create(
      patientData as any,
      {
        provider: undefined,
        user: { _id: doctorId, clues: doctorClues },
        patientData
      } as any
    )

    return { status: 'registered' }
  }
}

export const getOptions = (app: Application): ExternalPatientRegistrationServiceOptions => ({ app })
