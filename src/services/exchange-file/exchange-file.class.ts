// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type {
  ExchangeFile,
  ExchangeFileData,
  ExchangeFilePatch,
  ExchangeFileQuery
} from './exchange-file.schema'
import type { User } from '../users/users.schema'
import type { Patients } from '../patients/patients.schema'
import type { Records } from '../records/records.schema'
import type { Somas } from '../somas/somas.schema'
import { GENERO, SEXO_BIOLOGICO, SEXO_CURP, TIPO_PERSONAL } from './exchange-file.constants'
import { primaryDerechohabienciaKey } from '../../utils/afiliaciones'

export type { ExchangeFile, ExchangeFileData, ExchangeFilePatch, ExchangeFileQuery }

export interface ExchangeFileServiceOptions {
  app: Application
}

export interface ExchangeFileParams extends Params<ExchangeFileQuery> {
  user?: User
}

// --- Helpers ---

const toCofeprDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${date.getFullYear()}`
}

// Normalizes stored birthDate to dd/mm/aaaa expected by Cofepris
const normalizeBirthDate = (birthDate: string): string => {
  if (/^\d{4}-\d{2}-\d{2}/.test(birthDate)) {
    const [y, m, d] = birthDate.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }
  return birthDate
}

// Extracts creation timestamp from a MongoDB ObjectId string
const dateFromObjectId = (id: string): string => {
  try {
    return toCofeprDate(new Date(parseInt(id.substring(0, 8), 16) * 1000))
  } catch {
    return toCofeprDate(new Date())
  }
}

// Maps stored sex ("Masculino" | "Femenino" | "Intersexual") to Cofepris sexoCURP (1/2/3)
const mapSexCode = (sex: string): number => SEXO_CURP[sex] ?? 3

// Maps stored sex ("Masculino" | "Femenino" | "Intersexual") to Cofepris sexoBiologico (1/2/3)
const mapSexBiologico = (sex: string): number => SEXO_BIOLOGICO[sex] ?? 3

// Maps stored genre string to Cofepris genero code (0=NO ESPECIFICADO default)
const mapGenero = (genre: string): number => GENERO[genre] ?? 0

// Maps stored professionType string to Cofepris tipoPersonal catalog code
const mapTipoPersonal = (professionType: string): number => TIPO_PERSONAL[professionType] ?? 2

// Extracts numeric service code from ServiceArea string (e.g. "4 – CONSULTA EXTERNA GENERAL" → 4)
const mapServicioAtencion = (serviceArea: string): number => {
  const match = serviceArea.match(/^(\d+)/)
  return match ? parseInt(match[1]) : 4
}

// Lee un parámetro somatométrico por su clave. Antes esto buscaba por palabras
// dentro de un arreglo de textos ('peso', 'weight', 'estatura'...): el documento
// ahora guarda un objeto con claves fijas y la búsqueda difusa sobra.
// 0 es el "no medido" que espera el archivo de intercambio.
const getSomaValue = (values: Somas['values'] | undefined, campo: keyof Somas['values']): string =>
  values?.[campo] != null ? String(values[campo]) : '0'

// Splits a full name string into [nombre, primerApellido, segundoApellido]
// Names with 4+ words: last two are apellidos, rest is nombre (e.g. "LUIS FRANCISCO PUERTAS VASQUEZ")
const splitFullName = (fullName: string): [string, string, string] => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 4) {
    return [parts.slice(0, parts.length - 2).join(' '), parts[parts.length - 2], parts[parts.length - 1]]
  }
  if (parts.length === 3) return [parts[0], parts[1], parts[2]]
  if (parts.length === 2) return [parts[0], parts[1], 'XX']
  return [parts[0], 'XX', 'XX']
}

// --- Service ---

export class ExchangeFileService<ServiceParams extends ExchangeFileParams = ExchangeFileParams>
  implements ServiceInterface<ExchangeFile, ExchangeFileData, ServiceParams, ExchangeFilePatch>
{
  constructor(public options: ExchangeFileServiceOptions) {}

  async find(_params?: ServiceParams): Promise<ExchangeFile[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<ExchangeFile> {
    return { id: 0, patientId: String(id), recordId: '', fileRow: '' }
  }

  async create(data: ExchangeFileData, params?: ServiceParams): Promise<ExchangeFile>
  async create(data: ExchangeFileData[], params?: ServiceParams): Promise<ExchangeFile[]>
  async create(
    data: ExchangeFileData | ExchangeFileData[],
    params?: ServiceParams
  ): Promise<ExchangeFile | ExchangeFile[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    const app = this.options.app
    const user = params?.user as User

    // Fetch patient (no records) and the specific record in parallel
    const [patientResult, recordResult] = await Promise.all([
      app
        .service('patients')
        // @ts-ignore
        .get(data.patientId, { provider: undefined, query: { skipRecords: true } }) as unknown as Promise<{
        data: { patientsList: Patients[] }
      }>,
      app
        .service('records')
        .find({ provider: undefined, query: { _id: data.recordId, $limit: 1 } }) as unknown as Promise<{
        data: Records[]
      }>
    ])

    const patient = patientResult.data.patientsList[0]
    if (!patient) throw new Error(`Patient ${data.patientId} not found`)

    const record = recordResult.data[0]
    if (!record) throw new Error(`Record ${data.recordId} not found`)

    // Get somas: prefer the one linked in the record Associations, fallback to most recent for patient
    let somas: Somas | undefined
    const somasAssociation = record.Associations?.find((a) => a.Type === 'Somas')
    if (somasAssociation) {
      somas = (await app
        .service('somas')
        .get(somasAssociation.Id, { provider: undefined })) as unknown as Somas
    } else {
      const result = await app.service('somas').find({
        provider: undefined,
        query: { patientId: data.patientId, $sort: { dateTaken: -1 }, $limit: 1 }
      })
      somas = Array.isArray(result) ? result[0] : (result as any).data?.[0]
    }

    const sv = somas?.values
    const pi = patient.personalInfo
    const dx = record.Diagnosis ?? []

    // Prestador name parts
    const [nombrePrestador, primerApellidoPrestador, segundoApellidoPrestador] = splitFullName(user.name)

    // Diagnósticos — up to 3, CIE code truncated to 4 chars per spec
    const cie1 = dx[0]?.CIE?.substring(0, 4) ?? 'R69X'
    const confirmDx1 = dx[0] !== undefined ? (dx[0].Confirmed ? 1 : 0) : -1
    const cie2 = dx[1]?.CIE?.substring(0, 4) ?? ''
    const confirmDx2 = dx[1] !== undefined ? (dx[1].Confirmed ? 1 : 0) : -1
    const cie3 = dx[2]?.CIE?.substring(0, 4) ?? ''
    const confirmDx3 = dx[2] !== undefined ? (dx[2].Confirmed ? 1 : 0) : -1

    // 106-field pipe-delimited row per GIIS-B015-04-11 spec
    const fields: (string | number)[] = [
      // 1 — Identificación de la unidad. `clues` es una lista; se usa la primera
      // CLUES del médico (con fallback al string legacy si aún no está migrado).
      (Array.isArray(user.clues) ? user.clues[0] : user.clues)?.split('-')[0].trim().slice(-4) ?? '9998',

      // 2-8 — Datos del prestador de servicios
      142, // paisNacimiento: default México
      user.personalInfo.curp, // curpPrestador
      nombrePrestador, // nombrePrestador
      primerApellidoPrestador, // primerApellidoPrestador
      segundoApellidoPrestador, // segundoApellidoPrestador
      mapTipoPersonal(user.professionType), // tipoPersonal
      -1, // programaSMyMG

      // 9-23 — Datos del paciente
      pi.curp, // curpPaciente
      pi.names, // nombre
      pi.middleName, // primerApellido
      pi.lastName, // segundoApellido
      normalizeBirthDate(pi.birthDate), // fechaNacimiento dd/mm/aaaa
      patient.localizacion?.nacimiento?.pais?.catalogKey ?? 142, // paisNacPaciente (142=México default)
      patient.localizacion?.nacimiento?.estado?.catalogKey ?? -1, // entidadNacimiento
      mapSexCode(pi.sex), // sexoCURP (1=HOMBRE, 2=MUJER, 3=NO BINARIO)
      mapSexBiologico(pi.sex), // sexoBiologico (1=HOMBRE, 2=MUJER, 3=INTERSEXUAL)
      // 18-21 — Identidad de sector público. Se capturan en la ficha de
      // identificación y viven en patients.personalInfo, no en el record.
      pi.seAutodenominaAfromexicano ?? -1, // seAutodenominaAfromexicano
      pi.seConsideraIndigena ?? -1, // seConsideraIndigena
      pi.migrante ?? -1, // migrante
      pi.paisProcedencia ?? -1, // paisProcedencia
      mapGenero(pi.genre), // genero
      primaryDerechohabienciaKey(pi.derechohabiencia), // derechohabiencia (GIIS single-valued: primera afiliación)

      // 24-25 — Consulta
      dateFromObjectId(String(record._id)), // fechaConsulta (extraída del ObjectId del record)
      mapServicioAtencion(record.ServiceArea ?? '4'), // servicioAtencion

      // 26-39 — Somatometría y mediciones
      getSomaValue(sv, 'peso'), // peso kg
      getSomaValue(sv, 'talla'), // talla cm
      getSomaValue(sv, 'circAbdominal'), // circunferenciaCintura cm
      getSomaValue(sv, 'sistolica'), // sistolica mmHg
      getSomaValue(sv, 'diastolica'), // diastolica mmHg
      getSomaValue(sv, 'frecuenciaCardiaca'), // frecuenciaCardiaca lpm
      getSomaValue(sv, 'frecuenciaRespiratoria'), // frecuenciaRespiratoria rpm
      getSomaValue(sv, 'temperatura'), // temperatura °C
      getSomaValue(sv, 'saturacionOxigeno'), // saturacionOxigeno %
      getSomaValue(sv, 'glucemia'), // glucemia mg/dL
      -1, // tipoMedicion
      -1, // resultadoObtenidoATravesde
      -1, // embarazadaSinDiabetes
      -1, // sintomaticoRespiratorioTb

      // 40-51 — Diagnósticos
      record.FirstTimeInYear ? 1 : 0, // primeraVezAnio
      -1, // primeraVezUneme
      record.Temporality === 'PrimeraVez' ? 0 : 1, // relacionTemporal (0=PrimeraVez, 1=Subsecuente)
      cie1, // codigoCIEDiagnostico1
      confirmDx1, // confirmacionDiagnostica1 (0=presuntivo, 1=confirmado)
      dx[1] !== undefined ? 0 : -1, // primeraVezDiagnostico2
      cie2, // codigoCIEDiagnostico2 (vacío si no hay)
      confirmDx2, // confirmacionDiagnostica2
      dx[2] !== undefined ? 0 : -1, // primeraVezDiagnostico3
      cie3, // codigoCIEDiagnostico3 (vacío si no hay)
      confirmDx3, // confirmacionDiagnostica3
      -1, // intervencionesSMyA

      // 52-61 — Atención prenatal y embarazo
      -1, // atencionPregestacionalRt
      -1, // riesgo
      -1, // relacionTemporalEmbarazo
      -1, // planSeguridad
      -1, // trimestreGestacional
      -1, // primeraVezAltoRiesgo
      -1, // complicacionPorDiabetes
      -1, // complicacionPorInfUri
      -1, // complicacionPorPreEecla
      -1, // complicacionPorHemorragia

      // 62-76 — COVID-19, hipertensión, salud reproductiva femenina
      -1, // sospechaCovid19
      -1, // covid19Confirmado
      -1, // hipertensionArtPrexistente
      -1, // otrasAccPrescAcidoFolico
      -1, // otrasAccApoyoTraslado
      -1, // otrasAccApoyoTrasladoAme
      -1, // puerpera
      -1, // infeccionPuerperal
      -1, // terapiaHormonal
      -1, // periPostmenopausia
      -1, // its
      -1, // patologiaMamariaBenigna
      -1, // cancerMamario
      -1, // colposcopia
      -1, // cancerCervicouterino

      // 77-84 — Pediatría
      -1, // ninosAnort
      -1, // pruebaEdi
      -1, // resultadoEdi
      -1, // resultadoBattelle
      -1, // edasRt
      -1, // edasPlanTratamiento
      -1, // recuperadoDeshidratacion
      -1, // numeroSobresvsoTratamiento

      // 85-87 — IRAS / Neumonia
      -1, // irasRt
      -1, // irasPlantTratamiento
      -1, // neumoniaRt

      // 88-96 — Acciones preventivas y adulto mayor
      -1, // aplicacionCedulaCancer
      -1, // informaPrevencionAccidentes
      -1, // sintomaDepresiva
      -1, // alteracionMemoria
      -1, // aivdAbvd
      -1, // sindromeCaidas
      -1, // incontinenciaUrinaria
      -1, // motricidad
      -1, // asesorianutricional

      // 97-100 — Promoción y cartillas
      -1, // numeroSobresvsoPromocion
      0, // lineaVida
      0, // cartillaSalud
      0, // esquemaVacunacion

      // 101-106 — Referencia y modalidad
      0, // referidoPor
      -1, // contraReferido
      0, // telemedicina
      0, // teleconsulta
      0, // estudiosTeleconsulta
      0 // modalidadConsulDist
    ]

    return {
      id: 0,
      patientId: data.patientId,
      recordId: data.recordId,
      fileRow: fields.join('|')
    }
  }

  async update(_id: NullableId, data: ExchangeFileData, _params?: ServiceParams): Promise<ExchangeFile> {
    return { id: 0, patientId: data.patientId, recordId: data.recordId, fileRow: '' }
  }

  async patch(_id: NullableId, data: ExchangeFilePatch, _params?: ServiceParams): Promise<ExchangeFile> {
    return { id: 0, patientId: '', recordId: '', fileRow: '', ...data }
  }

  async remove(_id: NullableId, _params?: ServiceParams): Promise<ExchangeFile> {
    return { id: 0, patientId: '', recordId: '', fileRow: '' }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
