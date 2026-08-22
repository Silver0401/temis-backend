// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { LabsService } from './labs.class'

// Main data model schema
export const labsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: ObjectIdSchema(),
    recordId: Type.Optional(ObjectIdSchema()),
    name: Type.String(),
    diagnosisId: Type.Optional(Type.String()),
    dateTaken: Type.String(),
    values: Type.Array(
      Type.Object({
        fullName: Type.String(),
        abreviation: Type.String(),
        unit: Type.String(),
        value: Type.String()
      })
    )
  },
  { $id: 'Labs', additionalProperties: false }
)
export type Labs = Static<typeof labsSchema>
export const labsValidator = getValidator(labsSchema, dataValidator)
export const labsResolver = resolve<Labs, HookContext<LabsService>>({})

export const labsExternalResolver = resolve<Labs, HookContext<LabsService>>({})

// Schema for creating new entries
export const labsDataSchema = Type.Pick(
  labsSchema,
  ['dateTaken', 'patientId', 'values', 'diagnosisId', 'recordId', 'name'],
  {
    $id: 'LabsData'
  }
)
export type LabsData = Static<typeof labsDataSchema>
export const labsDataValidator = getValidator(labsDataSchema, dataValidator)
export const labsDataResolver = resolve<Labs, HookContext<LabsService>>({})

// Schema for updating existing entries
export const labsPatchSchema = Type.Partial(labsSchema, {
  $id: 'LabsPatch'
})
export type LabsPatch = Static<typeof labsPatchSchema>
export const labsPatchValidator = getValidator(labsPatchSchema, dataValidator)
export const labsPatchResolver = resolve<Labs, HookContext<LabsService>>({})

// Schema for allowed query properties
export const labsQueryProperties = Type.Pick(labsSchema, [
  '_id',
  'patientId',
  'dateTaken',
  'values',
  'diagnosisId',
  'name',
  'recordId'
])
export const labsQuerySchema = Type.Intersect(
  [
    querySyntax(labsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type LabsQuery = Static<typeof labsQuerySchema>
export const labsQueryValidator = getValidator(labsQuerySchema, queryValidator)
export const labsQueryResolver = resolve<LabsQuery, HookContext<LabsService>>({})
