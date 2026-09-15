import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { SuiveService } from './suive.class'

export const suiveCasoSchema = Type.Object({
  patientId: Type.String(),
  recordId: Type.String(),
  fechaConsulta: Type.String(),
  nombrePaciente: Type.String(),
  edad: Type.Union([Type.Number(), Type.Null()]),
  sexo: Type.Union([Type.String(), Type.Null()]),
  cieCapturado: Type.String(),
  epiClave: Type.Number(),
  diagnosticoSuive: Type.String(),
  grupo: Type.String(),
  notificacionInmediata: Type.Boolean(),
  estudioEpidemiologico: Type.Boolean(),
  estudioBrote: Type.Boolean()
})

export const suiveResumenSchema = Type.Object({
  epiClave: Type.Number(),
  diagnosticoSuive: Type.String(),
  grupo: Type.String(),
  casos: Type.Number()
})

export const suiveSchema = Type.Object(
  {
    casos: Type.Array(suiveCasoSchema),
    resumen: Type.Array(suiveResumenSchema),
    totalCasos: Type.Number(),
    totalPacientesRevisados: Type.Number(),
    omitidos: Type.Array(Type.Object({ patientId: Type.String(), reason: Type.String() })),
    /** Inconsistencias del catálogo que no deben quedar ocultas. */
    avisos: Type.Array(Type.String())
  },
  { $id: 'Suive', additionalProperties: false }
)
export type Suive = Static<typeof suiveSchema>
export type SuiveCaso = Static<typeof suiveCasoSchema>
export type SuiveResumen = Static<typeof suiveResumenSchema>
export const suiveValidator = getValidator(suiveSchema, dataValidator)
export const suiveResolver = resolve<Suive, HookContext<SuiveService>>({})
export const suiveExternalResolver = resolve<Suive, HookContext<SuiveService>>({})

export const suiveDataSchema = Type.Object(
  {
    patientIds: Type.Array(Type.String(), { minItems: 1 }),
    from: Type.Optional(Type.String()),
    to: Type.Optional(Type.String())
  },
  { $id: 'SuiveData', additionalProperties: false }
)
export type SuiveData = Static<typeof suiveDataSchema>
export const suiveDataValidator = getValidator(suiveDataSchema, dataValidator)
export const suiveDataResolver = resolve<SuiveData, HookContext<SuiveService>>({})

export const suiveQuerySchema = Type.Intersect(
  [querySyntax(Type.Object({})), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)
export type SuiveQuery = Static<typeof suiveQuerySchema>
export const suiveQueryValidator = getValidator(suiveQuerySchema, queryValidator)
export const suiveQueryResolver = resolve<SuiveQuery, HookContext<SuiveService>>({})
