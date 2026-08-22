// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosPatch,
  CatalogoEstablecimientosQuery,
  CatalogoEstablecimientosService
} from './catalogo-establecimientos.class'

export type {
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosPatch,
  CatalogoEstablecimientosQuery
}

export type CatalogoEstablecimientosClientService = Pick<
  CatalogoEstablecimientosService<Params<CatalogoEstablecimientosQuery>>,
  (typeof catalogoEstablecimientosMethods)[number]
>

export const catalogoEstablecimientosPath = 'catalogo-establecimientos'

export const catalogoEstablecimientosMethods: Array<keyof CatalogoEstablecimientosService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoEstablecimientosClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoEstablecimientosPath, connection.service(catalogoEstablecimientosPath), {
    methods: catalogoEstablecimientosMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoEstablecimientosPath]: CatalogoEstablecimientosClientService
  }
}
