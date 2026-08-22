// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import { BadRequest } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'
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
import { GENERO, SEXO_BIOLOGICO, SEXO_CURP, TIPO_PERSONAL, VACIO } from './exchange-file.constants'
import { primaryDerechohabienciaKey } from '../../utils/afiliaciones'

export type { ExchangeFile, ExchangeFileData, ExchangeFilePatch, ExchangeFileQuery }

export interface ExchangeFileServiceOptions {
  app: Application
}

export interface ExchangeFileParams extends Params<ExchangeFileQuery> {
  user?: User
}

// --- Helpers ---

/**
 * Tope de pacientes por descarga. No es una regla de negocio sino un freno:
 * cada paciente son varias consultas a Mongo y un archivo sin límite puede
 * dejar la petición colgada sin que nadie sepa por qué.
 */
const MAX_PACIENTES_POR_ARCHIVO = 500

/** Rango de `_id` que cubre un intervalo de fechas (el ObjectId lleva la fecha). */
const objectIdDesdeFecha = (fecha: Date, borde: 'inicio' | 'fin') =>
  new ObjectId(
    Math.floor(fecha.getTime() / 1000)
      .toString(16)
      .padStart(8, '0') + (borde === 'inicio' ? '0000000000000000' : 'ffffffffffffffff')
  )

const rangoDeObjectIds = (desde?: string, hasta?: string) => {
  const ini = desde ? new Date(desde) : undefined
  const fin = hasta ? new Date(`${hasta}T23:59:59.999Z`) : undefined
  if (ini && isNaN(ini.getTime())) throw new BadRequest('Fecha inicial inválida')
  if (fin && isNaN(fin.getTime())) throw new BadRequest('Fecha final inválida')
  if (!ini && !fin) return {}
  return {
    _id: {
      ...(ini ? { $gte: objectIdDesdeFecha(ini, 'inicio') } : {}),
      ...(fin ? { $lte: objectIdDesdeFecha(fin, 'fin') } : {})
    }
  }
}

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

/**
 * Lee una variable de un formulario dinámico del record.
 *
 * Los bloques (`General`, `Gynecology`, `Pediatrics`, `Geriatrics`,
 * `Administrativas`) son opcionales y sus campos también: una consulta de
 * adulto sano no tiene nada de pediatría. Cuando la variable no aplicó, la
 * columna va con `VACIO` en vez de quedarse con el marcador fijo que traía
 * antes el generador.
 */
const varClinica = (
  record: Records,
  bloque: 'General' | 'Gynecology' | 'Pediatrics' | 'Geriatrics' | 'Administrativas',
  campo: string
): number => {
  const valor = (record as any)?.[bloque]?.[campo]
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  // El formulario puede devolver el número como texto según el control usado.
  if (typeof valor === 'string' && valor.trim() !== '' && !Number.isNaN(Number(valor))) {
    return Number(valor)
  }
  return VACIO
}

/** Igual que `varClinica` pero para columnas de texto (riesgo, multivalor). */
const varClinicaTexto = (
  record: Records,
  bloque: 'General' | 'Gynecology' | 'Pediatrics' | 'Geriatrics' | 'Administrativas',
  campo: string
): string => {
  const valor = (record as any)?.[bloque]?.[campo]
  if (valor === undefined || valor === null || valor === '') return String(VACIO)
  // `intervencionesSMyA` es multivalor y viaja separado por "&".
  if (Array.isArray(valor)) return valor.length > 0 ? valor.join('&') : String(VACIO)
  return String(valor)
}

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

    // Lote: el archivo completo para una lista de pacientes.
    if (Array.isArray(data.patientIds)) {
      return this.crearPorLote(data, params)
    }

    if (!data.patientId || !data.recordId) {
      throw new BadRequest('Se requiere { patientId, recordId } o { patientIds }')
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
    const confirmDx1 = dx[0] !== undefined ? (dx[0].Confirmed ? 1 : 0) : VACIO
    const cie2 = dx[1]?.CIE?.substring(0, 4) ?? ''
    const confirmDx2 = dx[1] !== undefined ? (dx[1].Confirmed ? 1 : 0) : VACIO
    const cie3 = dx[2]?.CIE?.substring(0, 4) ?? ''
    const confirmDx3 = dx[2] !== undefined ? (dx[2].Confirmed ? 1 : 0) : VACIO

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
      VACIO, // programaSMyMG

      // 9-23 — Datos del paciente
      pi.curp, // curpPaciente
      pi.names, // nombre
      pi.middleName, // primerApellido
      pi.lastName, // segundoApellido
      normalizeBirthDate(pi.birthDate), // fechaNacimiento dd/mm/aaaa
      patient.localizacion?.nacimiento?.pais?.catalogKey ?? 142, // paisNacPaciente (142=México default)
      patient.localizacion?.nacimiento?.estado?.catalogKey ?? VACIO, // entidadNacimiento
      mapSexCode(pi.sex), // sexoCURP (1=HOMBRE, 2=MUJER, 3=NO BINARIO)
      mapSexBiologico(pi.sex), // sexoBiologico (1=HOMBRE, 2=MUJER, 3=INTERSEXUAL)
      // 18-21 — Identidad de sector público. Se capturan en la ficha de
      // identificación y viven en patients.personalInfo, no en el record.
      pi.seAutodenominaAfromexicano ?? VACIO, // seAutodenominaAfromexicano
      pi.seConsideraIndigena ?? VACIO, // seConsideraIndigena
      pi.migrante ?? VACIO, // migrante
      pi.paisProcedencia ?? VACIO, // paisProcedencia
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
      // Glucemia: el tipo y la procedencia salen de la somatometría, no de un
      // formulario aparte.
      sv?.glucemiaTipo ?? VACIO, // tipoMedicion
      sv?.glucemiaObtenida ?? VACIO, // resultadoObtenidoATravesde
      varClinica(record, 'Gynecology', 'embarazadaSinDiabetes'), // embarazadaSinDiabetes
      varClinica(record, 'General', 'sintomaticoRespiratorioTb'), // sintomaticoRespiratorioTb

      // 40-51 — Diagnósticos
      record.FirstTimeInYear ? 1 : 0, // primeraVezAnio
      varClinica(record, 'Administrativas', 'primeraVezUneme'), // primeraVezUneme
      record.Temporality === 'PrimeraVez' ? 0 : 1, // relacionTemporal (0=PrimeraVez, 1=Subsecuente)
      cie1, // codigoCIEDiagnostico1
      confirmDx1, // confirmacionDiagnostica1 (0=presuntivo, 1=confirmado)
      dx[1] !== undefined ? 0 : VACIO, // primeraVezDiagnostico2
      cie2, // codigoCIEDiagnostico2 (vacío si no hay)
      confirmDx2, // confirmacionDiagnostica2
      dx[2] !== undefined ? 0 : VACIO, // primeraVezDiagnostico3
      cie3, // codigoCIEDiagnostico3 (vacío si no hay)
      confirmDx3, // confirmacionDiagnostica3
      varClinicaTexto(record, 'General', 'intervencionesSMyA'), // intervencionesSMyA (multivalor "&")

      // 52-61 — Atención prenatal y embarazo
      varClinica(record, 'Gynecology', 'atencionPregestacionalRT'), // atencionPregestacionalRt
      varClinicaTexto(record, 'Gynecology', 'riesgo'), // riesgo
      varClinica(record, 'Gynecology', 'relacionTemporalEmbarazo'), // relacionTemporalEmbarazo
      varClinica(record, 'Gynecology', 'planSeguridad'), // planSeguridad
      varClinica(record, 'Gynecology', 'trimestreGestacional'), // trimestreGestacional
      varClinica(record, 'Gynecology', 'primeraVezAltoRiesgo'), // primeraVezAltoRiesgo
      varClinica(record, 'Gynecology', 'complicacionPorDiabetes'), // complicacionPorDiabetes
      varClinica(record, 'Gynecology', 'complicacionPorInfeccionUrinaria'), // complicacionPorInfUri
      varClinica(record, 'Gynecology', 'complicacionPorPreeclampsiaEclampsia'), // complicacionPorPreEecla
      varClinica(record, 'Gynecology', 'complicacionPorHemorragia'), // complicacionPorHemorragia

      // 62-76 — COVID-19, hipertensión, salud reproductiva femenina
      varClinica(record, 'Gynecology', 'sospechaCovid19'), // sospechaCovid19
      // No hay variable de confirmación de COVID en el record: no se captura en
      // ningún formulario, así que la columna va vacía y no inventada.
      VACIO, // covid19Confirmado
      varClinica(record, 'Gynecology', 'hipertensionarterialprexistente'), // hipertensionArtPrexistente
      varClinica(record, 'Gynecology', 'otrasAccPrescAcidoFolico'), // otrasAccPrescAcidoFolico
      varClinica(record, 'Gynecology', 'otrasAccApoyoTraslado'), // otrasAccApoyoTraslado
      varClinica(record, 'Gynecology', 'otrasACCApoyoTrasladoAME'), // otrasAccApoyoTrasladoAme
      varClinica(record, 'Gynecology', 'puerpera'), // puerpera
      varClinica(record, 'Gynecology', 'infeccionPuerperal'), // infeccionPuerperal
      varClinica(record, 'Gynecology', 'terapiaHormonal'), // terapiaHormonal
      varClinica(record, 'Gynecology', 'periPostMenopausia'), // periPostmenopausia
      varClinica(record, 'Gynecology', 'its'), // its
      varClinica(record, 'Gynecology', 'patologiaMamariaBenigna'), // patologiaMamariaBenigna
      varClinica(record, 'Gynecology', 'cancerMamario'), // cancerMamario
      varClinica(record, 'Gynecology', 'colposcopia'), // colposcopia
      varClinica(record, 'Gynecology', 'cancerCervicouterino'), // cancerCervicouterino

      // 77-84 — Pediatría
      varClinica(record, 'Pediatrics', 'ninoSanoRT'), // ninosAnort
      varClinica(record, 'Pediatrics', 'pruebaEDI'), // pruebaEdi
      varClinica(record, 'Pediatrics', 'resultadoEDI'), // resultadoEdi
      varClinica(record, 'Pediatrics', 'resultadoBattelle'), // resultadoBattelle
      varClinica(record, 'Pediatrics', 'edasRT'), // edasRt
      varClinica(record, 'Pediatrics', 'edasPlanTratamiento'), // edasPlanTratamiento
      varClinica(record, 'Pediatrics', 'recuperadoDeshidratacion'), // recuperadoDeshidratacion
      varClinica(record, 'Pediatrics', 'numeroSobresVSOTratamiento'), // numeroSobresvsoTratamiento

      // 85-87 — IRAS / Neumonia
      varClinica(record, 'Pediatrics', 'irasRT'), // irasRt
      varClinica(record, 'Pediatrics', 'irasPlanTratamiento'), // irasPlantTratamiento
      varClinica(record, 'Pediatrics', 'neumoniaRT'), // neumoniaRt

      // 88-96 — Acciones preventivas y adulto mayor
      varClinica(record, 'Pediatrics', 'aplicacionCedulaCancer'), // aplicacionCedulaCancer
      varClinica(record, 'Pediatrics', 'informaPrevencionAccidentes'), // informaPrevencionAccidentes
      varClinica(record, 'Geriatrics', 'sintomaDepresiva'), // sintomaDepresiva
      varClinica(record, 'Geriatrics', 'alteracionMemoria'), // alteracionMemoria
      varClinica(record, 'Geriatrics', 'aivd-ABVD'), // aivdAbvd
      varClinica(record, 'Geriatrics', 'sindromeCaidas'), // sindromeCaidas
      varClinica(record, 'Geriatrics', 'incontinenciaUrinaria'), // incontinenciaUrinaria
      varClinica(record, 'Geriatrics', 'motricidad'), // motricidad
      varClinica(record, 'Geriatrics', 'asesoriaNutricional'), // asesorianutricional

      // 97-100 — Promoción y cartillas
      varClinica(record, 'Administrativas', 'numeroSobresVSOPromocion'), // numeroSobresvsoPromocion
      varClinica(record, 'Administrativas', 'lineaVida'), // lineaVida
      varClinica(record, 'Administrativas', 'cartillaSalud'), // cartillaSalud
      varClinica(record, 'Administrativas', 'esquemaVacunacion'), // esquemaVacunacion

      // 101-106 — Referencia y modalidad
      varClinica(record, 'Administrativas', 'referidoPor'), // referidoPor
      varClinica(record, 'Administrativas', 'contrarreferido'), // contraReferido
      varClinica(record, 'Administrativas', 'telemedicina'), // telemedicina
      varClinica(record, 'Administrativas', 'teleconsulta'), // teleconsulta
      varClinica(record, 'Administrativas', 'estudiosTeleconsulta'), // estudiosTeleconsulta
      varClinica(record, 'Administrativas', 'modalidadConsulDist') // modalidadConsulDist
    ]

    return {
      id: 0,
      patientId: data.patientId,
      recordId: data.recordId,
      fileRow: fields.join('|')
    }
  }

  /**
   * El médico dueño del paciente.
   *
   * La relación vive en `users.patientsList` y no en el paciente, así que se
   * busca al revés: en qué lista cae este id. El id puede estar guardado como
   * ObjectId o como cadena según por dónde se haya dado de alta, de ahí que se
   * consulten las dos formas.
   */
  private async medicoDelPaciente(patientId: string): Promise<User | undefined> {
    const db = await this.options.app.get('mongodbClient')
    const posibles: any[] = [patientId]
    if (ObjectId.isValid(patientId)) posibles.push(new ObjectId(patientId))
    const owner = await db.collection('users').findOne({ patientsList: { $in: posibles } })
    return (owner as unknown as User) ?? undefined
  }

  /**
   * Archivo de intercambio para una lista de pacientes.
   *
   * De cada paciente se toma su PRIMERA consulta dentro del rango de fechas
   * —ordenando por `_id`, cuyos primeros bytes son la marca de tiempo—, un
   * renglón por paciente. Los que no tengan consulta en el rango se reportan en
   * `omitted` en lugar de abortar el archivo entero.
   */
  private async crearPorLote(data: ExchangeFileData, params?: ServiceParams): Promise<ExchangeFile> {
    const app = this.options.app
    const patientIds = data.patientIds ?? []
    if (patientIds.length === 0) throw new BadRequest('La lista de pacientes viene vacía')
    if (patientIds.length > MAX_PACIENTES_POR_ARCHIVO) {
      throw new BadRequest(
        `Demasiados pacientes en una sola descarga (máximo ${MAX_PACIENTES_POR_ARCHIVO})`
      )
    }

    const rangoIds = rangoDeObjectIds(data.from, data.to)
    const renglones: string[] = []
    const omitted: Array<{ patientId: string; reason: string }> = []

    // En serie y no en paralelo: cada paciente dispara varias consultas y una
    // ráfaga de cincuenta a la vez satura el pool de conexiones de Mongo.
    for (const patientId of patientIds) {
      try {
        const encontrados = (await app.service('records').find({
          provider: undefined,
          query: { patientId, ...rangoIds, $sort: { _id: 1 }, $limit: 1 }
        })) as unknown as { data: Records[] }

        const record = encontrados.data?.[0]
        if (!record) {
          omitted.push({ patientId, reason: 'Sin consultas en el periodo seleccionado' })
          continue
        }

        // El prestador del renglón es el médico que atendió, NO quien descarga
        // el archivo. Generándolo desde la consola de administración, usar
        // `params.user` habría firmado las consultas de todos los médicos con el
        // nombre, la CURP y la CLUES del administrador.
        const medico = await this.medicoDelPaciente(patientId)
        if (!medico) {
          omitted.push({ patientId, reason: 'No se pudo resolver el médico que lo atendió' })
          continue
        }

        const fila = (await this.create({ patientId, recordId: String(record._id) }, {
          ...(params ?? {}),
          user: medico
        } as ServiceParams)) as ExchangeFile
        renglones.push(fila.fileRow)
      } catch (error: any) {
        omitted.push({ patientId, reason: error?.message ?? 'Error desconocido' })
      }
    }

    return {
      id: 0,
      patientId: '',
      recordId: '',
      fileRow: '',
      fileContent: renglones.join('\n'),
      total: renglones.length,
      omitted
    }
  }

  async update(_id: NullableId, data: ExchangeFileData, _params?: ServiceParams): Promise<ExchangeFile> {
    return { id: 0, patientId: data.patientId ?? '', recordId: data.recordId ?? '', fileRow: '' }
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
