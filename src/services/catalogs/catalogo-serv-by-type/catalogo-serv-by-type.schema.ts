// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoServByTypeService } from './catalogo-serv-by-type.class'

// Main data model schema
export const catalogoServByTypeSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CATALOG_KEY: Type.Optional(Type.Number()),
    DESCRIPCION: Type.Optional(Type.String())
  },
  { $id: 'CatalogoServByType', additionalProperties: false }
)
export type CatalogoServByType = Static<typeof catalogoServByTypeSchema>
export const catalogoServByTypeValidator = getValidator(catalogoServByTypeSchema, dataValidator)
export const catalogoServByTypeResolver = resolve<
  CatalogoServByTypeQuery,
  HookContext<CatalogoServByTypeService>
>({})

export const catalogoServByTypeExternalResolver = resolve<
  CatalogoServByType,
  HookContext<CatalogoServByTypeService>
>({})

// Schema for creating new entries
export const catalogoServByTypeDataSchema = Type.Pick(
  catalogoServByTypeSchema,
  ['CATALOG_KEY', 'DESCRIPCION'],
  { $id: 'CatalogoServByTypeData' }
)
export type CatalogoServByTypeData = Static<typeof catalogoServByTypeDataSchema>
export const catalogoServByTypeDataValidator = getValidator(catalogoServByTypeDataSchema, dataValidator)
export const catalogoServByTypeDataResolver = resolve<
  CatalogoServByTypeData,
  HookContext<CatalogoServByTypeService>
>({})

// Schema for updating existing entries
export const catalogoServByTypePatchSchema = Type.Partial(catalogoServByTypeSchema, {
  $id: 'CatalogoServByTypePatch'
})
export type CatalogoServByTypePatch = Static<typeof catalogoServByTypePatchSchema>
export const catalogoServByTypePatchValidator = getValidator(catalogoServByTypePatchSchema, dataValidator)
export const catalogoServByTypePatchResolver = resolve<
  CatalogoServByTypePatch,
  HookContext<CatalogoServByTypeService>
>({})

// Schema for allowed query properties
export const catalogoServByTypeQueryProperties = Type.Pick(catalogoServByTypeSchema, ['_id', 'CATALOG_KEY', 'DESCRIPCION'])
export const catalogoServByTypeQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoServByTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoServByTypeQuery = Static<typeof catalogoServByTypeQuerySchema>
export const catalogoServByTypeQueryValidator = getValidator(catalogoServByTypeQuerySchema, queryValidator)
export const catalogoServByTypeQueryResolver = resolve<
  CatalogoServByTypeQuery,
  HookContext<CatalogoServByTypeService>
>({})
