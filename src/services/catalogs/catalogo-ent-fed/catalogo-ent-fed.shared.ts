// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoEntFed,
  CatalogoEntFedData,
  CatalogoEntFedPatch,
  CatalogoEntFedQuery,
  CatalogoEntFedService
} from './catalogo-ent-fed.class'

export type { CatalogoEntFed, CatalogoEntFedData, CatalogoEntFedPatch, CatalogoEntFedQuery }

export type CatalogoEntFedClientService = Pick<
  CatalogoEntFedService<Params<CatalogoEntFedQuery>>,
  (typeof catalogoEntFedMethods)[number]
>

export const catalogoEntFedPath = 'catalogo-ent-fed'

export const catalogoEntFedMethods: Array<keyof CatalogoEntFedService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoEntFedClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoEntFedPath, connection.service(catalogoEntFedPath), {
    methods: catalogoEntFedMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoEntFedPath]: CatalogoEntFedClientService
  }
}
