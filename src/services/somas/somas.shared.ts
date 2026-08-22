// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Somas, SomasData, SomasPatch, SomasQuery, SomasService } from './somas.class'

export type { Somas, SomasData, SomasPatch, SomasQuery }

export type SomasClientService = Pick<SomasService<Params<SomasQuery>>, (typeof somasMethods)[number]>

export const somasPath = 'somas'

export const somasMethods: Array<keyof SomasService> = ['find', 'get', 'create', 'patch', 'remove']

export const somasClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(somasPath, connection.service(somasPath), {
    methods: somasMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [somasPath]: SomasClientService
  }
}
