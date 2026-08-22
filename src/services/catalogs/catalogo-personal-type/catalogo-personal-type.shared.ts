// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypePatch,
  CatalogoPersonalTypeQuery,
  CatalogoPersonalTypeService
} from './catalogo-personal-type.class'

export type {
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypePatch,
  CatalogoPersonalTypeQuery
}

export type CatalogoPersonalTypeClientService = Pick<
  CatalogoPersonalTypeService<Params<CatalogoPersonalTypeQuery>>,
  (typeof catalogoPersonalTypeMethods)[number]
>

export const catalogoPersonalTypePath = 'catalogo-personal-type'

export const catalogoPersonalTypeMethods: Array<keyof CatalogoPersonalTypeService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoPersonalTypeClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoPersonalTypePath, connection.service(catalogoPersonalTypePath), {
    methods: catalogoPersonalTypeMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoPersonalTypePath]: CatalogoPersonalTypeClientService
  }
}
