// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesPatch,
  CatalogoAfiliacionesQuery,
  CatalogoAfiliacionesService
} from './catalogo-afiliaciones.class'

export type {
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesPatch,
  CatalogoAfiliacionesQuery
}

export type CatalogoAfiliacionesClientService = Pick<
  CatalogoAfiliacionesService<Params<CatalogoAfiliacionesQuery>>,
  (typeof catalogoAfiliacionesMethods)[number]
>

export const catalogoAfiliacionesPath = 'catalogo-afiliaciones'

export const catalogoAfiliacionesMethods: Array<keyof CatalogoAfiliacionesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoAfiliacionesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoAfiliacionesPath, connection.service(catalogoAfiliacionesPath), {
    methods: catalogoAfiliacionesMethods
  })
}

// Add this service to the client service type index
declare module './../../../client' {
  interface ServiceTypes {
    [catalogoAfiliacionesPath]: CatalogoAfiliacionesClientService
  }
}
