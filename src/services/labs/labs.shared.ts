// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Labs, LabsData, LabsPatch, LabsQuery, LabsService } from './labs.class'

export type { Labs, LabsData, LabsPatch, LabsQuery }

export type LabsClientService = Pick<LabsService<Params<LabsQuery>>, (typeof labsMethods)[number]>

export const labsPath = 'labs'

export const labsMethods: Array<keyof LabsService> = ['find', 'get', 'create', 'patch', 'remove']

export const labsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(labsPath, connection.service(labsPath), {
    methods: labsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [labsPath]: LabsClientService
  }
}
