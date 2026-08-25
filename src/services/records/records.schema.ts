// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { RecordsService } from './records.class'

const LocalizacionEntrySchema = Type.Object({
  id: Type.String(),
  nombre: Type.String(),
  catalogKey: Type.Optional(Type.Number())
})

const LocalizacionItemSchema = Type.Object({
  pais: Type.Optional(LocalizacionEntrySchema),
  estado: Type.Optional(LocalizacionEntrySchema),
  municipio: Type.Optional(LocalizacionEntrySchema),
  localidad: Type.Optional(LocalizacionEntrySchema),
  calle: Type.Optional(Type.String()),
  colonia: Type.Optional(Type.String())
})

// Derechohabiencia is multi-value: each selected afiliación carries its GIIS
// catalog key (catalogKey 0 = not from the catalog, e.g. AI-extracted).
const AfiliacionSchema = Type.Object({
  catalogKey: Type.Number(),
  descripcion: Type.String()
})

const PatientIdentificationSchema = Type.Object({
  names: Type.String(),
  middleName: Type.String(),
  lastName: Type.String(),
  sex: Type.Union([Type.Literal('Masculino'), Type.Literal('Femenino'), Type.Literal('Intersexual')]),
  birthDate: Type.String(),
  birthPlace: Type.String(),
  domicile: Type.Optional(Type.String()),
  nacimientoLocalizacion: Type.Optional(LocalizacionItemSchema),
  domicilioLocalizacion: Type.Optional(LocalizacionItemSchema),
  genre: Type.String(),
  derechohabiencia: Type.Array(AfiliacionSchema),
  curp: Type.String(),
  tel: Type.Optional(Type.String()),
  estadoCivil: Type.Optional(Type.String()),
  ocupacion: Type.Optional(Type.String()),
  escolaridad: Type.Optional(Type.String())
})

// Variables clínicas aplicables a CronosMD conforme a GIIS-B015-04-11.
// Se mantienen planas para conservar los identificadores oficiales del archivo de intercambio.
const GeneralClinicalVariablesSchema = {
  sintomaticoRespiratorioTb: Type.Optional(Type.Integer()), // CEX 39
  intervencionesSMyA: Type.Optional(Type.Any()) // CEX 51 — multivalor separado por "&"
}

const GynecologyClinicalVariablesSchema = {
  atencionPregestacionalRT: Type.Optional(Type.Integer()),
  riesgo: Type.Optional(Type.String({ maxLength: 10 })),
  relacionTemporalEmbarazo: Type.Optional(Type.Integer()),
  trimestreGestacional: Type.Optional(Type.Integer()),
  primeraVezAltoRiesgo: Type.Optional(Type.Integer()),
  complicacionPorDiabetes: Type.Optional(Type.Integer()),
  complicacionPorInfeccionUrinaria: Type.Optional(Type.Integer()),
  complicacionPorPreeclampsiaEclampsia: Type.Optional(Type.Integer()),
  complicacionPorHemorragia: Type.Optional(Type.Integer()),
  hipertensionarterialprexistente: Type.Optional(Type.Integer()),
  otrasAccPrescAcidoFolico: Type.Optional(Type.Integer()),
  puerpera: Type.Optional(Type.Integer()),
  infeccionPuerperal: Type.Optional(Type.Integer()),
  // Obligatorias en sector público (Temis); CronosMD las declaró fuera de alcance por ser privado.
  embarazadaSinDiabetes: Type.Optional(Type.Integer()), // CEX 38
  planSeguridad: Type.Optional(Type.Integer()), // CEX 55
  sospechaCovid19: Type.Optional(Type.Integer()), // CEX 62
  otrasAccApoyoTraslado: Type.Optional(Type.Integer()), // CEX 66
  otrasACCApoyoTrasladoAME: Type.Optional(Type.Integer()), // CEX 67
  terapiaHormonal: Type.Optional(Type.Integer()), // CEX 70
  periPostMenopausia: Type.Optional(Type.Integer()), // CEX 71
  its: Type.Optional(Type.Integer()), // CEX 72
  patologiaMamariaBenigna: Type.Optional(Type.Integer()), // CEX 73
  cancerMamario: Type.Optional(Type.Integer()), // CEX 74
  colposcopia: Type.Optional(Type.Integer()), // CEX 75
  cancerCervicouterino: Type.Optional(Type.Integer()) // CEX 76
}

const PediatricsClinicalVariablesSchema = {
  ninoSanoRT: Type.Optional(Type.Integer()),
  pruebaEDI: Type.Optional(Type.Integer()),
  resultadoEDI: Type.Optional(Type.Integer()),
  resultadoBattelle: Type.Optional(Type.Integer()),
  edasRT: Type.Optional(Type.Integer()),
  edasPlanTratamiento: Type.Optional(Type.Integer()),
  recuperadoDeshidratacion: Type.Optional(Type.Integer()),
  irasRT: Type.Optional(Type.Integer()),
  irasPlanTratamiento: Type.Optional(Type.Integer()),
  neumoniaRT: Type.Optional(Type.Integer()),
  // Obligatorias en sector público (Temis).
  numeroSobresVSOTratamiento: Type.Optional(Type.Integer()), // CEX 84
  aplicacionCedulaCancer: Type.Optional(Type.Integer()), // CEX 88
  informaPrevencionAccidentes: Type.Optional(Type.Integer()) // CEX 89
}

const GeriatricsClinicalVariablesSchema = {
  sintomaDepresiva: Type.Optional(Type.Integer()),
  alteracionMemoria: Type.Optional(Type.Integer()),
  'aivd-ABVD': Type.Optional(Type.Integer()),
  sindromeCaidas: Type.Optional(Type.Integer()),
  incontinenciaUrinaria: Type.Optional(Type.Integer()),
  motricidad: Type.Optional(Type.Integer()),
  asesoriaNutricional: Type.Optional(Type.Integer())
}

// --- Detecciones — GIIS-B019-04-09 (campos 37, 39-91) ---
// Los gates de edad/sexo/tipoPersonal los aplica el guide-router; aquí todo es opcional.
const DetectionsClinicalVariablesSchema = {
  tirasDeteccion: Type.Optional(Type.Integer()), // 37
  // Salud mental y cognición (39-44)
  depresionTamizaje: Type.Optional(Type.Integer()),
  depresion: Type.Optional(Type.Integer()),
  ansiedad: Type.Optional(Type.Integer()),
  haOlvidadoMasCosas: Type.Optional(Type.Integer()),
  alteracionesDeMemoria: Type.Optional(Type.Integer()),
  demencia: Type.Optional(Type.Integer()),
  // Geriatría funcional (45-58)
  tamizajeFugaDeOrina: Type.Optional(Type.Integer()),
  incontinenciaUriaria: Type.Optional(Type.Integer()),
  tamizajeCaidas: Type.Optional(Type.Integer()),
  caida60yMas: Type.Optional(Type.Integer()),
  marcha: Type.Optional(Type.Integer()),
  estadoNutricional: Type.Optional(Type.Integer()),
  abvdTamizaje: Type.Optional(Type.Integer()),
  abvdEvaluacion: Type.Optional(Type.Integer()),
  aivdTamizaje: Type.Optional(Type.Integer()),
  aivdEvaluacion: Type.Optional(Type.Integer()),
  edadCuidador: Type.Optional(Type.Integer()),
  sexoCuidador: Type.Optional(Type.Integer()),
  sobrecargaCuidador: Type.Optional(Type.Integer()),
  riesgoFractura: Type.Optional(Type.Integer()),
  // Crónicas (59-62)
  diabetesMellitus: Type.Optional(Type.Integer()),
  hipertensionArterial: Type.Optional(Type.Integer()),
  obesidad: Type.Optional(Type.Integer()),
  dislipidemias: Type.Optional(Type.Integer()),
  // Adicciones (63-72)
  alcohol: Type.Optional(Type.Integer()),
  tabaco: Type.Optional(Type.Integer()),
  cannabis: Type.Optional(Type.Integer()),
  cocaina: Type.Optional(Type.Integer()),
  metanfetaminas: Type.Optional(Type.Integer()),
  inhalables: Type.Optional(Type.Integer()),
  opiaceos: Type.Optional(Type.Integer()),
  alucinogenos: Type.Optional(Type.Integer()),
  tranquilizantes: Type.Optional(Type.Integer()),
  otrasSubstancias: Type.Optional(Type.Integer()),
  // ITS (73-78)
  B24X: Type.Optional(Type.Integer()),
  A539: Type.Optional(Type.Integer()),
  gonorrea: Type.Optional(Type.Integer()),
  hepatitisB: Type.Optional(Type.Integer()),
  herpesGenital: Type.Optional(Type.Integer()),
  chlamydia: Type.Optional(Type.Integer()),
  // Cáncer y sospecha genética (79-82, 85)
  resultadoVPH: Type.Optional(Type.Integer()),
  cancerCervicoUterino: Type.Optional(Type.Integer()),
  resultadoCancerCervicoUterino: Type.Optional(Type.Integer()),
  cancerMama: Type.Optional(Type.Integer()),
  sospechaSindromeTurner: Type.Optional(Type.Integer()),
  // Violencia (83-84)
  violenciaSexual: Type.Optional(Type.Integer()),
  violenciaMujer15yMas: Type.Optional(Type.Integer()),
  // Próstata (86-87)
  hiperplasiaProstatica: Type.Optional(Type.Integer()),
  reactivosAntigenoProstatico: Type.Optional(Type.Integer()),
  // Respiratorio (88-91)
  sintomaticoRespiratorio: Type.Optional(Type.Integer()),
  espirometriaVEF1_CVF: Type.Optional(Type.Integer()),
  LIN: Type.Optional(Type.Number()),
  espirometriaResultado: Type.Optional(Type.Integer())
}

// --- Planificación Familiar — GIIS-B018-04-09 (campos 44-63) ---
// Ojo con la semántica mixta: los métodos hormonales y de barrera llevan CANTIDAD
// entregada (0 = no entregado); implantes, DIU y quirúrgico usan -1 = no aplica.
const FamilyPlanningClinicalVariablesSchema = {
  puerperaAceptaPF: Type.Optional(Type.Integer()), // 44
  oral: Type.Optional(Type.Integer()),
  inyectableMensual: Type.Optional(Type.Integer()),
  inyectableBimestral: Type.Optional(Type.Integer()),
  inyectableTrimestral: Type.Optional(Type.Integer()),
  implanteSubdermico1Var: Type.Optional(Type.Integer()),
  implanteSubdermico2Var: Type.Optional(Type.Integer()),
  parcheDermico: Type.Optional(Type.Integer()),
  diu: Type.Optional(Type.Integer()),
  diuMedicado: Type.Optional(Type.Integer()),
  quirurgico: Type.Optional(Type.Integer()),
  preservativo: Type.Optional(Type.Integer()),
  preservativoFemenino: Type.Optional(Type.Integer()),
  otroMetodo: Type.Optional(Type.Integer()),
  anticoncepcionEmergencia: Type.Optional(Type.Integer()),
  altaConAzoospermia: Type.Optional(Type.Integer()),
  OycPlanificacionF: Type.Optional(Type.Integer()),
  OycPrevencionITS: Type.Optional(Type.Integer()),
  OycPrevencionEmb: Type.Optional(Type.Integer()),
  OycOtrasSSRA: Type.Optional(Type.Integer()) // 63
}

// --- Administrativas de la atención (sector público) ---
// Huérfanas de grupo: aplican a toda atención, se piden siempre.
const AdministrativeClinicalVariablesSchema = {
  primeraVezUneme: Type.Optional(Type.Integer()), // CEX 41
  numeroSobresVSOPromocion: Type.Optional(Type.Integer()), // CEX 97
  lineaVida: Type.Optional(Type.Integer()), // CEX 98
  cartillaSalud: Type.Optional(Type.Integer()), // CEX 99
  esquemaVacunacion: Type.Optional(Type.Integer()), // CEX 100
  referidoPor: Type.Optional(Type.Integer()), // CEX 101
  contrarreferido: Type.Optional(Type.Integer()), // CEX 102
  telemedicina: Type.Optional(Type.Integer()), // CEX 103
  teleconsulta: Type.Optional(Type.Integer()), // CEX 104
  estudiosTeleconsulta: Type.Optional(Type.Integer()), // CEX 105
  modalidadConsulDist: Type.Optional(Type.Integer()) // CEX 106
}

const ClinicalVariablesSchema = {
  Geriatrics: Type.Optional(Type.Object(GeriatricsClinicalVariablesSchema)),
  General: Type.Optional(Type.Object(GeneralClinicalVariablesSchema)),
  Gynecology: Type.Optional(Type.Object(GynecologyClinicalVariablesSchema)),
  Pediatrics: Type.Optional(Type.Object(PediatricsClinicalVariablesSchema)),
  Detections: Type.Optional(Type.Object(DetectionsClinicalVariablesSchema)),
  FamilyPlanning: Type.Optional(Type.Object(FamilyPlanningClinicalVariablesSchema)),
  Administrativas: Type.Optional(Type.Object(AdministrativeClinicalVariablesSchema))
}

// Main data model schema
/**
 * Tipo de asiento del expediente. NO es una elección del médico: lo deriva el
 * servidor de si el registro abre expediente (sin `patientId`) o lo continúa.
 * Antes el frontend ofrecía elegir entre "historia clínica" y "nota rápida",
 * una dualidad que no cambiaba nada de lo que se guardaba.
 */
const RecordEntryTypeSchema = Type.Union([Type.Literal('ClinicalHistoryInit'), Type.Literal('EvolutionNote')])

export const recordsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: Type.Optional(ObjectIdSchema()),
    ClinicalHistory: Type.String(),
    Entry: Type.Object({
      type: RecordEntryTypeSchema,
      text: Type.String()
    }),
    Diagnosis: Type.Array(
      Type.Object({
        id: Type.String(),
        Name: Type.String(),
        CIE: Type.Optional(Type.String()),
        Confirmed: Type.Boolean()
      })
    ),
    Temporality: Type.Union([Type.Literal('PrimeraVez'), Type.Literal('Subsecuente')]),
    FirstTimeInYear: Type.Boolean(),
    ServiceArea: Type.String(),
    ...ClinicalVariablesSchema,
    Associations: Type.Optional(
      Type.Array(
        Type.Object({
          Type: Type.Union([
            Type.Literal('Labs'),
            Type.Literal('Somas'),
            Type.Literal('Imgs'),
            Type.Literal('Orders'),
            Type.Literal('Maps'),
            Type.Literal('Drugs')
          ]),
          Id: Type.String()
        })
      )
    )
  },
  { $id: 'Records', additionalProperties: false }
)
export type Records = Static<typeof recordsSchema>
export const recordsValidator = getValidator(recordsSchema, dataValidator)
export const recordsResolver = resolve<Records, HookContext<RecordsService>>({})

export const recordsExternalResolver = resolve<Records, HookContext<RecordsService>>({})

// Entrada COMPLETA del catálogo DIAGNOSTICO_SIS que el médico eligió en el
// buscador CIE del frontend. Se manda entera —no solo clave y nombre— porque el
// router de guías necesita sus metadatos (CLAVE_CAPITULO, EPI_CLAVE,
// DIA_CRONICOS, LINF/LSUP/LSEX) para decidir qué bloques del formulario pintar.
//
// Ojo: es dato que viene del cliente. `giis-record-validator` NO lo lee: vuelve
// a consultar el catálogo por CATALOG_KEY para validar sexo y edad. Este objeto
// es una comodidad de ruteo, nunca una fuente de verdad para validar.
const DiagnosticoCatalogoSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    CONSECUTIVO: Type.Optional(Type.String()),
    LETRA: Type.Optional(Type.String()),
    CATALOG_KEY: Type.String(),
    NOMBRE: Type.String(),
    DIA_CRONICOS: Type.Optional(Type.String()),
    DIA_CAINFANTIL: Type.Optional(Type.String()),
    LSEX: Type.Optional(Type.String()),
    LINF: Type.Optional(Type.String()),
    LSUP: Type.Optional(Type.String()),
    CLAVE_PROGRAMA_SIS: Type.Optional(Type.String()),
    CLAVE_CAPITULO: Type.Optional(Type.String()),
    CAPITULO: Type.Optional(Type.String()),
    ES_SUIVE_MORB: Type.Optional(Type.String()),
    EPI_CLAVE: Type.Optional(Type.String()),
    'EPI_CLAVE_DESC 2024': Type.Optional(Type.String()),
    TIPO_PERSONAL_1VEZ_CE: Type.Optional(Type.String()),
    TIPO_PERSONAL_SUBSEC_CE: Type.Optional(Type.String()),
    VALIDO_SM: Type.Optional(Type.String()),
    VALIDO_SB: Type.Optional(Type.String()),
    VALIDO_PF: Type.Optional(Type.String())
  },
  { additionalProperties: false }
)

// Schema for creating new entries
export const recordsDataSchema = Type.Object(
  {
    ClinicalHistory: Type.String(),
    patientId: Type.Optional(ObjectIdSchema()),
    // Lo pone el resolver `recordsDataResolver`, no el cliente.
    Entry: Type.Optional(
      Type.Object({
        type: RecordEntryTypeSchema,
        text: Type.String()
      })
    ),
    Diagnosis: Type.Optional(
      Type.Array(
        Type.Object({
          id: Type.String(),
          Name: Type.String(),
          CIE: Type.Optional(Type.String()),
          Confirmed: Type.Boolean()
        })
      )
    ),
    // GIIS reporta hasta tres diagnósticos por atención; el formulario permite
    // capturar más y los guarda todos, el archivo de intercambio toma los tres
    // primeros.
    diagnosisCatalog: Type.Optional(Type.Array(DiagnosticoCatalogoSchema)),
    ServiceArea: Type.Optional(Type.String()),
    FirstTimeInYear: Type.Optional(Type.Boolean()),

    ...ClinicalVariablesSchema,
    patientIdentification: Type.Optional(PatientIdentificationSchema),
    userLocalizacion: Type.Optional(
      Type.Object({
        nacimiento: Type.Optional(LocalizacionItemSchema),
        domicilio: Type.Optional(LocalizacionItemSchema)
      })
    )
  },
  { $id: 'RecordsData', additionalProperties: false }
)
export type RecordsData = Static<typeof recordsDataSchema>
export const recordsDataValidator = getValidator(recordsDataSchema, dataValidator)
// Sin default: NOM-024 prohíbe rellenar ServiceArea con un valor fijo cuando
// el usuario no lo elige explícitamente (ver record_doc_type.ts, rama de alta nueva).
export const recordsDataResolver = resolve<Records, HookContext<RecordsService>>({
  // Sin `patientId` el registro abre expediente; con él, lo continúa.
  Entry: async (value, data) =>
    (value as any) ??
    ({
      type: (data as any)?.patientId ? 'EvolutionNote' : 'ClinicalHistoryInit',
      text: 'NA'
    } as any)
})

// Schema for updating existing entries
export const recordsPatchSchema = Type.Partial(recordsSchema, {
  $id: 'RecordsPatch'
})
export type RecordsPatch = Static<typeof recordsPatchSchema>
export const recordsPatchValidator = getValidator(recordsPatchSchema, dataValidator)
export const recordsPatchResolver = resolve<Records, HookContext<RecordsService>>({})

// Schema for allowed query properties
export const recordsQueryProperties = Type.Pick(recordsSchema, [
  '_id',
  'ClinicalHistory',
  'Entry',
  'patientId',
  'Diagnosis',
  'Temporality',
  'FirstTimeInYear'
])
export const recordsQuerySchema = Type.Intersect(
  [
    querySyntax(recordsQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        synthesize: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type RecordsQuery = Static<typeof recordsQuerySchema>
export const recordsQueryValidator = getValidator(recordsQuerySchema, queryValidator)
export const recordsQueryResolver = resolve<RecordsQuery, HookContext<RecordsService>>({})
