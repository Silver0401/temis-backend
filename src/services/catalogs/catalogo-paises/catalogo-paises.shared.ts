// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoPaises,
  CatalogoPaisesData,
  CatalogoPaisesPatch,
  CatalogoPaisesQuery,
  CatalogoPaisesService
} from './catalogo-paises.class'

export type { CatalogoPaises, CatalogoPaisesData, CatalogoPaisesPatch, CatalogoPaisesQuery }

export type CatalogoPaisesClientService = Pick<
  CatalogoPaisesService<Params<CatalogoPaisesQuery>>,
  (typeof catalogoPaisesMethods)[number]
>

export const catalogoPaisesPath = 'catalogo-paises'

export const catalogoPaisesMethods: Array<keyof CatalogoPaisesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoPaisesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoPaisesPath, connection.service(catalogoPaisesPath), {
    methods: catalogoPaisesMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoPaisesPath]: CatalogoPaisesClientService
  }
}
