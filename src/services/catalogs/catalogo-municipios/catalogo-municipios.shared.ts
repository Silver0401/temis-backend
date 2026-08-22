// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  CatalogoMunicipios,
  CatalogoMunicipiosData,
  CatalogoMunicipiosPatch,
  CatalogoMunicipiosQuery,
  CatalogoMunicipiosService
} from './catalogo-municipios.class'

export type { CatalogoMunicipios, CatalogoMunicipiosData, CatalogoMunicipiosPatch, CatalogoMunicipiosQuery }

export type CatalogoMunicipiosClientService = Pick<
  CatalogoMunicipiosService<Params<CatalogoMunicipiosQuery>>,
  (typeof catalogoMunicipiosMethods)[number]
>

export const catalogoMunicipiosPath = 'catalogo-municipios'

export const catalogoMunicipiosMethods: Array<keyof CatalogoMunicipiosService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const catalogoMunicipiosClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(catalogoMunicipiosPath, connection.service(catalogoMunicipiosPath), {
    methods: catalogoMunicipiosMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [catalogoMunicipiosPath]: CatalogoMunicipiosClientService
  }
}
