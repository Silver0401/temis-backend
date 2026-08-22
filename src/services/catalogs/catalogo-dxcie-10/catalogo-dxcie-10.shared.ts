// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoDxcie10,
  CatalogoDxcie10Data,
  CatalogoDxcie10Patch,
  CatalogoDxcie10Query,
  CatalogoDxcie10Service
} from './catalogo-dxcie-10.class'

export type { CatalogoDxcie10, CatalogoDxcie10Data, CatalogoDxcie10Patch, CatalogoDxcie10Query }

export type CatalogoDxcie10ClientService = Pick<
  CatalogoDxcie10Service<Params<CatalogoDxcie10Query>>,
  (typeof catalogoDxcie10Methods)[number]
>

export const catalogoDxcie10Path = 'catalogo-dxcie-10'

export const catalogoDxcie10Methods: Array<keyof CatalogoDxcie10Service> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoDxcie10Client = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoDxcie10Path, connection.service(catalogoDxcie10Path), {
    methods: catalogoDxcie10Methods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoDxcie10Path]: CatalogoDxcie10ClientService
  }
}
