import type { ClientApplication } from '../../client'
import type { ConsentSignService } from './consent-sign.class'
import type { ConsentSignData, ConsentSignGetResult, ConsentSignResult } from './consent-sign.schema'

export type { ConsentSignData, ConsentSignGetResult, ConsentSignResult }

export type ConsentSignClientService = Pick<ConsentSignService, 'get' | 'create'>

export const consentSignPath = 'consent-sign'
export const consentSignMethods: Array<'get' | 'create'> = ['get', 'create']

export const consentSignClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(consentSignPath, connection.service(consentSignPath), { methods: consentSignMethods })
}

declare module '../../client' {
  interface ServiceTypes {
    [consentSignPath]: ConsentSignClientService
  }
}
