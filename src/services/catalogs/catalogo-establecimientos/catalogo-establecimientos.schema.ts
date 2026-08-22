// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoEstablecimientosService } from './catalogo-establecimientos.class'

// Main data model schema
export const catalogoEstablecimientosSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    clues: Type.Optional(Type.String()),
    sub_abreviacion: Type.Optional(Type.String()),
    tip_abreviacion: Type.Optional(Type.String()),
    nombre_unidad: Type.Optional(Type.String()),
    en_operacion: Type.Optional(Type.Number()),
    id_entidad_federativa: Type.Optional(Type.Number()),
    tipo_unidad: Type.Optional(Type.Number()),
    institucion: Type.Optional(Type.String())
  },
  { $id: 'CatalogoEstablecimientos', additionalProperties: false }
)
export type CatalogoEstablecimientos = Static<typeof catalogoEstablecimientosSchema>
export const catalogoEstablecimientosValidator = getValidator(catalogoEstablecimientosSchema, dataValidator)
export const catalogoEstablecimientosResolver = resolve<
  CatalogoEstablecimientosQuery,
  HookContext<CatalogoEstablecimientosService>
>({})

export const catalogoEstablecimientosExternalResolver = resolve<
  CatalogoEstablecimientos,
  HookContext<CatalogoEstablecimientosService>
>({})

// Schema for creating new entries
export const catalogoEstablecimientosDataSchema = Type.Pick(
  catalogoEstablecimientosSchema,
  ['clues', 'sub_abreviacion', 'tip_abreviacion', 'nombre_unidad', 'en_operacion', 'id_entidad_federativa', 'tipo_unidad', 'institucion'],
  { $id: 'CatalogoEstablecimientosData' }
)
export type CatalogoEstablecimientosData = Static<typeof catalogoEstablecimientosDataSchema>
export const catalogoEstablecimientosDataValidator = getValidator(
  catalogoEstablecimientosDataSchema,
  dataValidator
)
export const catalogoEstablecimientosDataResolver = resolve<
  CatalogoEstablecimientosData,
  HookContext<CatalogoEstablecimientosService>
>({})

// Schema for updating existing entries
export const catalogoEstablecimientosPatchSchema = Type.Partial(catalogoEstablecimientosSchema, {
  $id: 'CatalogoEstablecimientosPatch'
})
export type CatalogoEstablecimientosPatch = Static<typeof catalogoEstablecimientosPatchSchema>
export const catalogoEstablecimientosPatchValidator = getValidator(
  catalogoEstablecimientosPatchSchema,
  dataValidator
)
export const catalogoEstablecimientosPatchResolver = resolve<
  CatalogoEstablecimientosPatch,
  HookContext<CatalogoEstablecimientosService>
>({})

// Schema for allowed query properties
export const catalogoEstablecimientosQueryProperties = Type.Pick(catalogoEstablecimientosSchema, [
  '_id',
  'clues',
  'nombre_unidad',
  'institucion',
  'id_entidad_federativa',
  'en_operacion'
])
export const catalogoEstablecimientosQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoEstablecimientosQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoEstablecimientosQuery = Static<typeof catalogoEstablecimientosQuerySchema>
export const catalogoEstablecimientosQueryValidator = getValidator(
  catalogoEstablecimientosQuerySchema,
  queryValidator
)
export const catalogoEstablecimientosQueryResolver = resolve<
  CatalogoEstablecimientosQuery,
  HookContext<CatalogoEstablecimientosService>
>({})
