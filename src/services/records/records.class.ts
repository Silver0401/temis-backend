// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params, Id } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Records, RecordsData, RecordsPatch, RecordsQuery } from './records.schema'

export type { Records, RecordsData, RecordsPatch, RecordsQuery }

export interface RecordsParams extends MongoDBAdapterParams<RecordsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class RecordsService<ServiceParams extends Params = RecordsParams> extends MongoDBService<
  Records,
  RecordsData,
  RecordsParams,
  RecordsPatch
> {
  // @ts-ignore
  async get(id: Id, _params?: ServiceParams): Promise<Records[]> {
    const RecordsFetched = await this.find({
      query: {
        patientId: id
      },
      // @ts-ignore
      $sort: {
        _id: -1
      }
    })

    // console.log(RecordsFetched)

    return RecordsFetched.data
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('records'))
      .then((collection) => {
        // Se consulta siempre por patientId (get por paciente y $lookup en patients).
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
