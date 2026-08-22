// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { TemplateService } from './template.class'

// Main data model schema
export const templateSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Template', additionalProperties: false }
)
export type Template = Static<typeof templateSchema>
export const templateValidator = getValidator(templateSchema, dataValidator)
export const templateResolver = resolve<Template, HookContext<TemplateService>>({})

export const templateExternalResolver = resolve<Template, HookContext<TemplateService>>({})

// Schema for creating new entries
export const templateDataSchema = Type.Pick(templateSchema, ['text'], {
  $id: 'TemplateData'
})
export type TemplateData = Static<typeof templateDataSchema>
export const templateDataValidator = getValidator(templateDataSchema, dataValidator)
export const templateDataResolver = resolve<Template, HookContext<TemplateService>>({})

// Schema for updating existing entries
export const templatePatchSchema = Type.Partial(templateSchema, {
  $id: 'TemplatePatch'
})
export type TemplatePatch = Static<typeof templatePatchSchema>
export const templatePatchValidator = getValidator(templatePatchSchema, dataValidator)
export const templatePatchResolver = resolve<Template, HookContext<TemplateService>>({})

// Schema for allowed query properties
export const templateQueryProperties = Type.Pick(templateSchema, ['id', 'text'])
export const templateQuerySchema = Type.Intersect(
  [
    querySyntax(templateQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type TemplateQuery = Static<typeof templateQuerySchema>
export const templateQueryValidator = getValidator(templateQuerySchema, queryValidator)
export const templateQueryResolver = resolve<TemplateQuery, HookContext<TemplateService>>({})
