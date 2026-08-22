// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoEntFedService } from './catalogo-ent-fed.class'

// Main data model schema
export const catalogoEntFedSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CATALOG_KEY: Type.Optional(Type.String()),
    ENTIDAD_FEDERATIVA: Type.Optional(Type.String()),
    ABREVIATURA: Type.Optional(Type.String())
  },
  { $id: 'CatalogoEntFed', additionalProperties: false }
)
export type CatalogoEntFed = Static<typeof catalogoEntFedSchema>
export const catalogoEntFedValidator = getValidator(catalogoEntFedSchema, dataValidator)
export const catalogoEntFedResolver = resolve<CatalogoEntFedQuery, HookContext<CatalogoEntFedService>>({})

export const catalogoEntFedExternalResolver = resolve<CatalogoEntFed, HookContext<CatalogoEntFedService>>({})

// Schema for creating new entries
export const catalogoEntFedDataSchema = Type.Pick(
  catalogoEntFedSchema,
  ['CATALOG_KEY', 'ENTIDAD_FEDERATIVA', 'ABREVIATURA'],
  { $id: 'CatalogoEntFedData' }
)
export type CatalogoEntFedData = Static<typeof catalogoEntFedDataSchema>
export const catalogoEntFedDataValidator = getValidator(catalogoEntFedDataSchema, dataValidator)
export const catalogoEntFedDataResolver = resolve<CatalogoEntFedData, HookContext<CatalogoEntFedService>>({})

// Schema for updating existing entries
export const catalogoEntFedPatchSchema = Type.Partial(catalogoEntFedSchema, {
  $id: 'CatalogoEntFedPatch'
})
export type CatalogoEntFedPatch = Static<typeof catalogoEntFedPatchSchema>
export const catalogoEntFedPatchValidator = getValidator(catalogoEntFedPatchSchema, dataValidator)
export const catalogoEntFedPatchResolver = resolve<CatalogoEntFedPatch, HookContext<CatalogoEntFedService>>(
  {}
)

// Schema for allowed query properties
export const catalogoEntFedQueryProperties = Type.Pick(catalogoEntFedSchema, ['_id', 'CATALOG_KEY', 'ENTIDAD_FEDERATIVA', 'ABREVIATURA'])
export const catalogoEntFedQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoEntFedQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoEntFedQuery = Static<typeof catalogoEntFedQuerySchema>
export const catalogoEntFedQueryValidator = getValidator(catalogoEntFedQuerySchema, queryValidator)
export const catalogoEntFedQueryResolver = resolve<CatalogoEntFedQuery, HookContext<CatalogoEntFedService>>(
  {}
)
