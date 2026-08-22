// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoPaisesService } from './catalogo-paises.class'

// Main data model schema
export const catalogoPaisesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CATALOG_KEY: Type.Optional(Type.Number()),
    DESCRIPCION: Type.Optional(Type.String()),
    ORDEN: Type.Optional(Type.Number())
  },
  { $id: 'CatalogoPaises', additionalProperties: false }
)
export type CatalogoPaises = Static<typeof catalogoPaisesSchema>
export const catalogoPaisesValidator = getValidator(catalogoPaisesSchema, dataValidator)
export const catalogoPaisesResolver = resolve<CatalogoPaisesQuery, HookContext<CatalogoPaisesService>>({})

export const catalogoPaisesExternalResolver = resolve<CatalogoPaises, HookContext<CatalogoPaisesService>>({})

// Schema for creating new entries
export const catalogoPaisesDataSchema = Type.Pick(
  catalogoPaisesSchema,
  ['CATALOG_KEY', 'DESCRIPCION', 'ORDEN'],
  { $id: 'CatalogoPaisesData' }
)
export type CatalogoPaisesData = Static<typeof catalogoPaisesDataSchema>
export const catalogoPaisesDataValidator = getValidator(catalogoPaisesDataSchema, dataValidator)
export const catalogoPaisesDataResolver = resolve<CatalogoPaisesData, HookContext<CatalogoPaisesService>>({})

// Schema for updating existing entries
export const catalogoPaisesPatchSchema = Type.Partial(catalogoPaisesSchema, {
  $id: 'CatalogoPaisesPatch'
})
export type CatalogoPaisesPatch = Static<typeof catalogoPaisesPatchSchema>
export const catalogoPaisesPatchValidator = getValidator(catalogoPaisesPatchSchema, dataValidator)
export const catalogoPaisesPatchResolver = resolve<CatalogoPaisesPatch, HookContext<CatalogoPaisesService>>(
  {}
)

// Schema for allowed query properties
export const catalogoPaisesQueryProperties = Type.Pick(catalogoPaisesSchema, ['_id', 'CATALOG_KEY', 'DESCRIPCION', 'ORDEN'])
export const catalogoPaisesQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoPaisesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoPaisesQuery = Static<typeof catalogoPaisesQuerySchema>
export const catalogoPaisesQueryValidator = getValidator(catalogoPaisesQuerySchema, queryValidator)
export const catalogoPaisesQueryResolver = resolve<CatalogoPaisesQuery, HookContext<CatalogoPaisesService>>(
  {}
)
