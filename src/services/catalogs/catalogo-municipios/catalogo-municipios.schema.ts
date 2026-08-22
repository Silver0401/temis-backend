// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { CatalogoMunicipiosService } from './catalogo-municipios.class'

// Main data model schema
export const catalogoMunicipiosSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    EFE_KEY: Type.Optional(Type.String()),
    CATALOG_KEY: Type.Optional(Type.Number()),
    MUNICIPIO: Type.Optional(Type.String()),
    CVEGEO: Type.Optional(Type.Number())
  },
  { $id: 'CatalogoMunicipios', additionalProperties: false }
)
export type CatalogoMunicipios = Static<typeof catalogoMunicipiosSchema>
export const catalogoMunicipiosValidator = getValidator(catalogoMunicipiosSchema, dataValidator)
export const catalogoMunicipiosResolver = resolve<
  CatalogoMunicipiosQuery,
  HookContext<CatalogoMunicipiosService>
>({})

export const catalogoMunicipiosExternalResolver = resolve<
  CatalogoMunicipios,
  HookContext<CatalogoMunicipiosService>
>({})

// Schema for creating new entries
export const catalogoMunicipiosDataSchema = Type.Pick(
  catalogoMunicipiosSchema,
  ['EFE_KEY', 'CATALOG_KEY', 'MUNICIPIO', 'CVEGEO'],
  { $id: 'CatalogoMunicipiosData' }
)
export type CatalogoMunicipiosData = Static<typeof catalogoMunicipiosDataSchema>
export const catalogoMunicipiosDataValidator = getValidator(catalogoMunicipiosDataSchema, dataValidator)
export const catalogoMunicipiosDataResolver = resolve<
  CatalogoMunicipiosData,
  HookContext<CatalogoMunicipiosService>
>({})

// Schema for updating existing entries
export const catalogoMunicipiosPatchSchema = Type.Partial(catalogoMunicipiosSchema, {
  $id: 'CatalogoMunicipiosPatch'
})
export type CatalogoMunicipiosPatch = Static<typeof catalogoMunicipiosPatchSchema>
export const catalogoMunicipiosPatchValidator = getValidator(catalogoMunicipiosPatchSchema, dataValidator)
export const catalogoMunicipiosPatchResolver = resolve<
  CatalogoMunicipiosPatch,
  HookContext<CatalogoMunicipiosService>
>({})

// Schema for allowed query properties
export const catalogoMunicipiosQueryProperties = Type.Pick(catalogoMunicipiosSchema, ['_id', 'CATALOG_KEY', 'EFE_KEY', 'MUNICIPIO', 'CVEGEO'])
export const catalogoMunicipiosQuerySchema = Type.Intersect(
  [
    querySyntax(catalogoMunicipiosQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CatalogoMunicipiosQuery = Static<typeof catalogoMunicipiosQuerySchema>
export const catalogoMunicipiosQueryValidator = getValidator(catalogoMunicipiosQuerySchema, queryValidator)
export const catalogoMunicipiosQueryResolver = resolve<
  CatalogoMunicipiosQuery,
  HookContext<CatalogoMunicipiosService>
>({})
