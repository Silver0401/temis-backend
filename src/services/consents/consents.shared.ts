import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { ConsentData, ConsentQuery } from './consents.schema'
import type { ConsentsService } from './consents.class'

export type ConsentsClientService = Pick<
  ConsentsService<Params<ConsentQuery>>,
  (typeof consentsMethods)[number]
>

export const consentsPath = 'consents'
export const consentsMethods: Array<keyof ConsentsService> = ['find', 'get', 'create']

export const consentsClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(consentsPath, connection.service(consentsPath), { methods: consentsMethods })
}

export type { ConsentData, ConsentQuery }

declare module '../../client' {
  interface ServiceTypes {
    [consentsPath]: ConsentsClientService
  }
}
