import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { AdminConsoleService } from './admin-console.class'

export const adminConsolePath = 'admin-console'

export const adminConsoleMethods: Array<keyof AdminConsoleService> = ['get']

export type AdminConsoleClientService = Pick<AdminConsoleService, (typeof adminConsoleMethods)[number]>

export const adminConsoleClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(adminConsolePath, connection.service(adminConsolePath), {
    methods: adminConsoleMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [adminConsolePath]: AdminConsoleClientService
  }
}

export type { Params }
