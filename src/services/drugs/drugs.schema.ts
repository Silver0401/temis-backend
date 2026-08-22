// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { DrugsService } from './drugs.class'

// Main data model schema
export const drugsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: ObjectIdSchema(),
    recordId: Type.Optional(ObjectIdSchema()),
    diagnosisId: Type.Optional(Type.String()),
    // Un renglón por fármaco recetado. `name` es la presentación completa tal
    // como viene del catálogo de fármacos e `indication` la posología que
    // escribe el médico. Antes eran cinco campos que un modelo de lenguaje
    // deducía de texto libre; el formulario sólo captura estos dos.
    values: Type.Array(
      Type.Object({
        name: Type.String(),
        indication: Type.String()
      })
    )
  },
  { $id: 'Drugs', additionalProperties: false }
)
export type Drugs = Static<typeof drugsSchema>
export const drugsValidator = getValidator(drugsSchema, dataValidator)
export const drugsResolver = resolve<Drugs, HookContext<DrugsService>>({})

export const drugsExternalResolver = resolve<Drugs, HookContext<DrugsService>>({})

// Schema for creating new entries
export const drugsDataSchema = Type.Pick(drugsSchema, ['patientId', 'values', 'recordId', 'diagnosisId'], {
  $id: 'DrugsData'
})
export type DrugsData = Static<typeof drugsDataSchema>
export const drugsDataValidator = getValidator(drugsDataSchema, dataValidator)
export const drugsDataResolver = resolve<Drugs, HookContext<DrugsService>>({})

// Schema for updating existing entries
export const drugsPatchSchema = Type.Partial(drugsSchema, {
  $id: 'DrugsPatch'
})
export type DrugsPatch = Static<typeof drugsPatchSchema>
export const drugsPatchValidator = getValidator(drugsPatchSchema, dataValidator)
export const drugsPatchResolver = resolve<Drugs, HookContext<DrugsService>>({})

// Schema for allowed query properties
export const drugsQueryProperties = Type.Pick(drugsSchema, [
  '_id',
  'patientId',
  'recordId',
  'diagnosisId',
  'values'
])
export const drugsQuerySchema = Type.Intersect(
  [
    querySyntax(drugsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type DrugsQuery = Static<typeof drugsQuerySchema>
export const drugsQueryValidator = getValidator(drugsQuerySchema, queryValidator)
export const drugsQueryResolver = resolve<DrugsQuery, HookContext<DrugsService>>({})
