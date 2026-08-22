// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { NoAuthTemplateService } from './no-auth-template.class'

// Main data model schema
export const noAuthTemplateSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'NoAuthTemplate', additionalProperties: false }
)
export type NoAuthTemplate = Static<typeof noAuthTemplateSchema>
export const noAuthTemplateValidator = getValidator(noAuthTemplateSchema, dataValidator)
export const noAuthTemplateResolver = resolve<NoAuthTemplateQuery, HookContext<NoAuthTemplateService>>({})

export const noAuthTemplateExternalResolver = resolve<NoAuthTemplate, HookContext<NoAuthTemplateService>>({})

// Schema for creating new entries
export const noAuthTemplateDataSchema = Type.Pick(noAuthTemplateSchema, ['text'], {
  $id: 'NoAuthTemplateData'
})
export type NoAuthTemplateData = Static<typeof noAuthTemplateDataSchema>
export const noAuthTemplateDataValidator = getValidator(noAuthTemplateDataSchema, dataValidator)
export const noAuthTemplateDataResolver = resolve<NoAuthTemplateData, HookContext<NoAuthTemplateService>>({})

// Schema for updating existing entries
export const noAuthTemplatePatchSchema = Type.Partial(noAuthTemplateSchema, {
  $id: 'NoAuthTemplatePatch'
})
export type NoAuthTemplatePatch = Static<typeof noAuthTemplatePatchSchema>
export const noAuthTemplatePatchValidator = getValidator(noAuthTemplatePatchSchema, dataValidator)
export const noAuthTemplatePatchResolver = resolve<NoAuthTemplatePatch, HookContext<NoAuthTemplateService>>(
  {}
)

// Schema for allowed query properties
export const noAuthTemplateQueryProperties = Type.Pick(noAuthTemplateSchema, ['_id', 'text'])
export const noAuthTemplateQuerySchema = Type.Intersect(
  [
    querySyntax(noAuthTemplateQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type NoAuthTemplateQuery = Static<typeof noAuthTemplateQuerySchema>
export const noAuthTemplateQueryValidator = getValidator(noAuthTemplateQuerySchema, queryValidator)
export const noAuthTemplateQueryResolver = resolve<NoAuthTemplateQuery, HookContext<NoAuthTemplateService>>(
  {}
)
