import type { ClientApplication } from '../../client'
import type {
  RecordRedeemService,
  RecordRedeemData,
  RecordRedeemResult
} from './record-redeem.class'

export type { RecordRedeemData, RecordRedeemResult }

export type RecordRedeemClientService = Pick<RecordRedeemService, 'create'>

export const recordRedeemPath = 'record-redeem'

export const recordRedeemMethods: Array<'create'> = ['create']

export const recordRedeemClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(recordRedeemPath, connection.service(recordRedeemPath), {
    methods: recordRedeemMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [recordRedeemPath]: RecordRedeemClientService
  }
}
