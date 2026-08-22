// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoAfiliacionesService } from './catalogo-afiliaciones.class'

// Main data model schema
export const catalogoAfiliacionesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CATALOG_KEY: Type.Optional(Type.Number()),
    'DESCRIPCIÓN CORTA': Type.Optional(Type.String()),
    'DESCRIPCIÓN LARGA': Type.Optional(Type.String()),
    VIGENTE: Type.Optional(Type.Number())
  },
  { $id: 'CatalogoAfiliaciones', additionalProperties: false }
)
export type CatalogoAfiliaciones = Static<typeof catalogoAfiliacionesSchema>
export const catalogoAfiliacionesValidator = getValidator(catalogoAfiliacionesSchema, dataValidator)
export const catalogoAfiliacionesResolver = resolve<
  CatalogoAfiliacionesQuery,
  HookContext<CatalogoAfiliacionesService>
>({})

export const catalogoAfiliacionesExternalResolver = resolve<
  CatalogoAfiliaciones,
  HookContext<CatalogoAfiliacionesService>
>({})

// Schema for creating new entries
export const catalogoAfiliacionesDataSchema = Type.Pick(
  catalogoAfiliacionesSchema,
  ['CATALOG_KEY', 'DESCRIPCIÓN CORTA', 'DESCRIPCIÓN LARGA', 'VIGENTE'],
  { $id: 'CatalogoAfiliacionesData' }
)
export type CatalogoAfiliacionesData = Static<typeof catalogoAfiliacionesDataSchema>
export const catalogoAfiliacionesDataValidator = getValidator(catalogoAfiliacionesDataSchema, dataValidator)
export const catalogoAfiliacionesDataResolver = resolve<
  CatalogoAfiliacionesData,
  HookContext<CatalogoAfiliacionesService>
>({})

// Schema for updating existing entries
export const catalogoAfiliacionesPatchSchema = Type.Partial(catalogoAfiliacionesSchema, {
  $id: 'CatalogoAfiliacionesPatch'
})
export type CatalogoAfiliacionesPatch = Static<typeof catalogoAfiliacionesPatchSchema>
export const catalogoAfiliacionesPatchValidator = getValidator(catalogoAfiliacionesPatchSchema, dataValidator)
export const catalogoAfiliacionesPatchResolver = resolve<
  CatalogoAfiliacionesPatch,
  HookContext<CatalogoAfiliacionesService>
>({})

// Schema for allowed query properties
export const catalogoAfiliacionesQueryProperties = Type.Pick(catalogoAfiliacionesSchema, ['_id', 'CATALOG_KEY', 'DESCRIPCIÓN CORTA'])
export const catalogoAfiliacionesQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoAfiliacionesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoAfiliacionesQuery = Static<typeof catalogoAfiliacionesQuerySchema>
export const catalogoAfiliacionesQueryValidator = getValidator(
  catalogoAfiliacionesQuerySchema,
  queryValidator
)
export const catalogoAfiliacionesQueryResolver = resolve<
  CatalogoAfiliacionesQuery,
  HookContext<CatalogoAfiliacionesService>
>({})
