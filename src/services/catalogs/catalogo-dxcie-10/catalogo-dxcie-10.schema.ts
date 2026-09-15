// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoDxcie10Service } from './catalogo-dxcie-10.class'

// Main data model schema
export const catalogoDxcie10Schema = Type.Object(
  {
    _id: ObjectIdSchema(),
    CONSECUTIVO: Type.Optional(Type.Number()),
    LETRA: Type.Optional(Type.String()),
    CATALOG_KEY: Type.Optional(Type.String()),
    NOMBRE: Type.Optional(Type.String()),
    DIA_CRONICOS: Type.Optional(Type.String()),
    DIA_CAINFANTIL: Type.Optional(Type.String()),
    LSEX: Type.Optional(Type.String()),
    LINF: Type.Optional(Type.String()),
    LSUP: Type.Optional(Type.String()),
    CLAVE_PROGRAMA_SIS: Type.Optional(Type.Number()),
    CLAVE_CAPITULO: Type.Optional(Type.String()),
    CAPITULO: Type.Optional(Type.String()),
    ES_SUIVE_MORB: Type.Optional(Type.String()),
    EPI_CLAVE: Type.Optional(Type.String()),
    'EPI_CLAVE_DESC 2024': Type.Optional(Type.String()),
    TIPO_PERSONAL_1VEZ_CE: Type.Optional(Type.String()),
    TIPO_PERSONAL_SUBSEC_CE: Type.Optional(Type.String()),
    VALIDO_SM: Type.Optional(Type.String()),
    VALIDO_SB: Type.Optional(Type.String()),
    VALIDO_PF: Type.Optional(Type.String())
  },
  { $id: 'CatalogoDxcie10', additionalProperties: false }
)
export type CatalogoDxcie10 = Static<typeof catalogoDxcie10Schema>
export const catalogoDxcie10Validator = getValidator(catalogoDxcie10Schema, dataValidator)
export const catalogoDxcie10Resolver = resolve<CatalogoDxcie10Query, HookContext<CatalogoDxcie10Service>>({})

export const catalogoDxcie10ExternalResolver = resolve<CatalogoDxcie10, HookContext<CatalogoDxcie10Service>>(
  {}
)

// Schema for creating new entries
export const catalogoDxcie10DataSchema = Type.Pick(
  catalogoDxcie10Schema,
  [
    'CONSECUTIVO',
    'LETRA',
    'CATALOG_KEY',
    'NOMBRE',
    'DIA_CRONICOS',
    'DIA_CAINFANTIL',
    'LSEX',
    'LINF',
    'LSUP',
    'CLAVE_PROGRAMA_SIS',
    'CLAVE_CAPITULO',
    'CAPITULO',
    'ES_SUIVE_MORB',
    'EPI_CLAVE',
    'EPI_CLAVE_DESC 2024',
    'TIPO_PERSONAL_1VEZ_CE',
    'TIPO_PERSONAL_SUBSEC_CE',
    'VALIDO_SM',
    'VALIDO_SB',
    'VALIDO_PF'
  ],
  { $id: 'CatalogoDxcie10Data' }
)
export type CatalogoDxcie10Data = Static<typeof catalogoDxcie10DataSchema>
export const catalogoDxcie10DataValidator = getValidator(catalogoDxcie10DataSchema, dataValidator)
export const catalogoDxcie10DataResolver = resolve<CatalogoDxcie10Data, HookContext<CatalogoDxcie10Service>>(
  {}
)

// Schema for updating existing entries
export const catalogoDxcie10PatchSchema = Type.Partial(catalogoDxcie10Schema, {
  $id: 'CatalogoDxcie10Patch'
})
export type CatalogoDxcie10Patch = Static<typeof catalogoDxcie10PatchSchema>
export const catalogoDxcie10PatchValidator = getValidator(catalogoDxcie10PatchSchema, dataValidator)
export const catalogoDxcie10PatchResolver = resolve<
  CatalogoDxcie10Patch,
  HookContext<CatalogoDxcie10Service>
>({})

// Schema for allowed query properties
export const catalogoDxcie10QueryProperties = Type.Pick(catalogoDxcie10Schema, [
  '_id',
  'CATALOG_KEY',
  'NOMBRE',
  'LETRA'
])
export const catalogoDxcie10QuerySchema = Type.Intersect(
  [
    querySyntax(catalogoDxcie10QueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoDxcie10Query = Static<typeof catalogoDxcie10QuerySchema>
export const catalogoDxcie10QueryValidator = getValidator(catalogoDxcie10QuerySchema, queryValidator)
export const catalogoDxcie10QueryResolver = resolve<
  CatalogoDxcie10Query,
  HookContext<CatalogoDxcie10Service>
>({})
