// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoPersonalTypeService } from './catalogo-personal-type.class'

// Main data model schema
export const catalogoPersonalTypeSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CATALOG_KEY: Type.Optional(Type.Number()),
    TIPO_PERSONAL: Type.Optional(Type.String())
  },
  { $id: 'CatalogoPersonalType', additionalProperties: false }
)
export type CatalogoPersonalType = Static<typeof catalogoPersonalTypeSchema>
export const catalogoPersonalTypeValidator = getValidator(catalogoPersonalTypeSchema, dataValidator)
export const catalogoPersonalTypeResolver = resolve<
  CatalogoPersonalTypeQuery,
  HookContext<CatalogoPersonalTypeService>
>({})

export const catalogoPersonalTypeExternalResolver = resolve<
  CatalogoPersonalType,
  HookContext<CatalogoPersonalTypeService>
>({})

// Schema for creating new entries
export const catalogoPersonalTypeDataSchema = Type.Pick(
  catalogoPersonalTypeSchema,
  ['CATALOG_KEY', 'TIPO_PERSONAL'],
  { $id: 'CatalogoPersonalTypeData' }
)
export type CatalogoPersonalTypeData = Static<typeof catalogoPersonalTypeDataSchema>
export const catalogoPersonalTypeDataValidator = getValidator(catalogoPersonalTypeDataSchema, dataValidator)
export const catalogoPersonalTypeDataResolver = resolve<
  CatalogoPersonalTypeData,
  HookContext<CatalogoPersonalTypeService>
>({})

// Schema for updating existing entries
export const catalogoPersonalTypePatchSchema = Type.Partial(catalogoPersonalTypeSchema, {
  $id: 'CatalogoPersonalTypePatch'
})
export type CatalogoPersonalTypePatch = Static<typeof catalogoPersonalTypePatchSchema>
export const catalogoPersonalTypePatchValidator = getValidator(catalogoPersonalTypePatchSchema, dataValidator)
export const catalogoPersonalTypePatchResolver = resolve<
  CatalogoPersonalTypePatch,
  HookContext<CatalogoPersonalTypeService>
>({})

// Schema for allowed query properties
export const catalogoPersonalTypeQueryProperties = Type.Pick(catalogoPersonalTypeSchema, ['_id', 'CATALOG_KEY', 'TIPO_PERSONAL'])
export const catalogoPersonalTypeQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoPersonalTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoPersonalTypeQuery = Static<typeof catalogoPersonalTypeQuerySchema>
export const catalogoPersonalTypeQueryValidator = getValidator(
  catalogoPersonalTypeQuerySchema,
  queryValidator
)
export const catalogoPersonalTypeQueryResolver = resolve<
  CatalogoPersonalTypeQuery,
  HookContext<CatalogoPersonalTypeService>
>({})
