// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Drugs, DrugsData, DrugsPatch, DrugsQuery, DrugsService } from './drugs.class'

export type { Drugs, DrugsData, DrugsPatch, DrugsQuery }

export type DrugsClientService = Pick<DrugsService<Params<DrugsQuery>>, (typeof drugsMethods)[number]>

export const drugsPath = 'drugs'

export const drugsMethods: Array<keyof DrugsService> = ['find', 'get', 'create', 'patch', 'remove']

export const drugsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(drugsPath, connection.service(drugsPath), {
    methods: drugsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [drugsPath]: DrugsClientService
  }
}
