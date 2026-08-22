// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ImgsService } from './imgs.class'

// Main data model schema
export const imgsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: ObjectIdSchema(),
    recordId: Type.Optional(ObjectIdSchema()),
    diagnosisId: Type.Optional(Type.String()),
    Name: Type.String(),
    Interpretation: Type.String(),
    Type: Type.Union([
      Type.Literal('XRay'),
      Type.Literal('TAC'),
      Type.Literal('MRI'),
      Type.Literal('US'),
      Type.Literal('Foto'),
      Type.Literal('Otro')
    ]),
    Image: Type.Optional(Type.String()),
    DateOfStudy: Type.String()
  },
  { $id: 'Imgs', additionalProperties: false }
)
export type Imgs = Static<typeof imgsSchema>
export const imgsValidator = getValidator(imgsSchema, dataValidator)
export const imgsResolver = resolve<Imgs, HookContext<ImgsService>>({})

export const imgsExternalResolver = resolve<Imgs, HookContext<ImgsService>>({})

// Schema for creating new entries
export const imgsDataSchema = Type.Pick(
  imgsSchema,
  ['patientId', 'Name', 'Interpretation', 'Type', 'Image', 'DateOfStudy', 'diagnosisId', 'recordId'],
  {
    $id: 'ImgsData'
  }
)
export type ImgsData = Static<typeof imgsDataSchema>
export const imgsDataValidator = getValidator(imgsDataSchema, dataValidator)
export const imgsDataResolver = resolve<Imgs, HookContext<ImgsService>>({})

// Schema for updating existing entries
export const imgsPatchSchema = Type.Partial(imgsSchema, {
  $id: 'ImgsPatch'
})
export type ImgsPatch = Static<typeof imgsPatchSchema>
export const imgsPatchValidator = getValidator(imgsPatchSchema, dataValidator)
export const imgsPatchResolver = resolve<Imgs, HookContext<ImgsService>>({})

// Schema for allowed query properties
export const imgsQueryProperties = Type.Pick(imgsSchema, [
  '_id',
  'patientId',
  'diagnosisId',
  'Name',
  'Interpretation',
  'Type',
  'Image',
  'DateOfStudy'
])
export const imgsQuerySchema = Type.Intersect(
  [
    querySyntax(imgsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ImgsQuery = Static<typeof imgsQuerySchema>
export const imgsQueryValidator = getValidator(imgsQuerySchema, queryValidator)
export const imgsQueryResolver = resolve<ImgsQuery, HookContext<ImgsService>>({})
