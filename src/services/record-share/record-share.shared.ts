import type { ClientApplication } from '../../client'
import type {
  RecordShareService,
  RecordShareData,
  RecordShareResult
} from './record-share.class'

export type { RecordShareData, RecordShareResult }

export type RecordShareClientService = Pick<RecordShareService, 'create'>

export const recordSharePath = 'record-share'

export const recordShareMethods: Array<'create'> = ['create']

export const recordShareClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(recordSharePath, connection.service(recordSharePath), {
    methods: recordShareMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [recordSharePath]: RecordShareClientService
  }
}
