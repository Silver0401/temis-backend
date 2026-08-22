// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoServByType,
  CatalogoServByTypeData,
  CatalogoServByTypePatch,
  CatalogoServByTypeQuery,
  CatalogoServByTypeService
} from './catalogo-serv-by-type.class'

export type { CatalogoServByType, CatalogoServByTypeData, CatalogoServByTypePatch, CatalogoServByTypeQuery }

export type CatalogoServByTypeClientService = Pick<
  CatalogoServByTypeService<Params<CatalogoServByTypeQuery>>,
  (typeof catalogoServByTypeMethods)[number]
>

export const catalogoServByTypePath = 'catalogo-serv-by-type'

export const catalogoServByTypeMethods: Array<keyof CatalogoServByTypeService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoServByTypeClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoServByTypePath, connection.service(catalogoServByTypePath), {
    methods: catalogoServByTypeMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoServByTypePath]: CatalogoServByTypeClientService
  }
}
