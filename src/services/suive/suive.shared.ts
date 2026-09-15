import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Suive, SuiveData, SuiveQuery, SuiveService } from './suive.class'

export type { Suive, SuiveData, SuiveQuery }

export type SuiveClientService = Pick<SuiveService<Params<SuiveQuery>>, (typeof suiveMethods)[number]>

export const suivePath = 'suive'
export const suiveMethods: Array<keyof SuiveService> = ['create']

export const suiveClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(suivePath, connection.service(suivePath), { methods: suiveMethods })
}

declare module '../../client' {
  interface ServiceTypes {
    [suivePath]: SuiveClientService
  }
}
