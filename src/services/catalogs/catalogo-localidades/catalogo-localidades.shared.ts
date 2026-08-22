// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesPatch,
  CatalogoLocalidadesQuery,
  CatalogoLocalidadesService
} from './catalogo-localidades.class'

export type {
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesPatch,
  CatalogoLocalidadesQuery
}

export type CatalogoLocalidadesClientService = Pick<
  CatalogoLocalidadesService<Params<CatalogoLocalidadesQuery>>,
  (typeof catalogoLocalidadesMethods)[number]
>

export const catalogoLocalidadesPath = 'catalogo-localidades'

export const catalogoLocalidadesMethods: Array<keyof CatalogoLocalidadesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoLocalidadesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoLocalidadesPath, connection.service(catalogoLocalidadesPath), {
    methods: catalogoLocalidadesMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoLocalidadesPath]: CatalogoLocalidadesClientService
  }
}
