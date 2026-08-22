// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ExchangeFile,
  ExchangeFileData,
  ExchangeFilePatch,
  ExchangeFileQuery,
  ExchangeFileService
} from './exchange-file.class'

export type { ExchangeFile, ExchangeFileData, ExchangeFilePatch, ExchangeFileQuery }

export type ExchangeFileClientService = Pick<
  ExchangeFileService<Params<ExchangeFileQuery>>,
  (typeof exchangeFileMethods)[number]
>

export const exchangeFilePath = 'exchange-file'

export const exchangeFileMethods: Array<keyof ExchangeFileService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const exchangeFileClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(exchangeFilePath, connection.service(exchangeFilePath), {
    methods: exchangeFileMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [exchangeFilePath]: ExchangeFileClientService
  }
}
