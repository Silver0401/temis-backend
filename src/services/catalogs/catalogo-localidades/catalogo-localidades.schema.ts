// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoLocalidadesService } from './catalogo-localidades.class'

// Main data model schema
export const catalogoLocalidadesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    EFE_KEY: Type.Optional(Type.String()),
    MUN_KEY: Type.Optional(Type.Number()),
    CATALOG_KEY: Type.Optional(Type.Number()),
    LOCALIDAD: Type.Optional(Type.String()),
    CVEGEO: Type.Optional(Type.Number())
  },
  { $id: 'CatalogoLocalidades', additionalProperties: false }
)
export type CatalogoLocalidades = Static<typeof catalogoLocalidadesSchema>
export const catalogoLocalidadesValidator = getValidator(catalogoLocalidadesSchema, dataValidator)
export const catalogoLocalidadesResolver = resolve<
  CatalogoLocalidadesQuery,
  HookContext<CatalogoLocalidadesService>
>({})

export const catalogoLocalidadesExternalResolver = resolve<
  CatalogoLocalidades,
  HookContext<CatalogoLocalidadesService>
>({})

// Schema for creating new entries
export const catalogoLocalidadesDataSchema = Type.Pick(
  catalogoLocalidadesSchema,
  ['EFE_KEY', 'MUN_KEY', 'CATALOG_KEY', 'LOCALIDAD', 'CVEGEO'],
  { $id: 'CatalogoLocalidadesData' }
)
export type CatalogoLocalidadesData = Static<typeof catalogoLocalidadesDataSchema>
export const catalogoLocalidadesDataValidator = getValidator(catalogoLocalidadesDataSchema, dataValidator)
export const catalogoLocalidadesDataResolver = resolve<
  CatalogoLocalidadesData,
  HookContext<CatalogoLocalidadesService>
>({})

// Schema for updating existing entries
export const catalogoLocalidadesPatchSchema = Type.Partial(catalogoLocalidadesSchema, {
  $id: 'CatalogoLocalidadesPatch'
})
export type CatalogoLocalidadesPatch = Static<typeof catalogoLocalidadesPatchSchema>
export const catalogoLocalidadesPatchValidator = getValidator(catalogoLocalidadesPatchSchema, dataValidator)
export const catalogoLocalidadesPatchResolver = resolve<
  CatalogoLocalidadesPatch,
  HookContext<CatalogoLocalidadesService>
>({})

// Schema for allowed query properties
export const catalogoLocalidadesQueryProperties = Type.Pick(catalogoLocalidadesSchema, ['_id', 'CATALOG_KEY', 'EFE_KEY', 'MUN_KEY', 'LOCALIDAD', 'CVEGEO'])
export const catalogoLocalidadesQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoLocalidadesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoLocalidadesQuery = Static<typeof catalogoLocalidadesQuerySchema>
export const catalogoLocalidadesQueryValidator = getValidator(catalogoLocalidadesQuerySchema, queryValidator)
export const catalogoLocalidadesQueryResolver = resolve<
  CatalogoLocalidadesQuery,
  HookContext<CatalogoLocalidadesService>
>({})
