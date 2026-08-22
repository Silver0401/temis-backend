// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Logs, LogsData, LogsQuery } from './logs.schema'
import { ObjectId } from 'mongodb'

export type { Logs, LogsData, LogsQuery }

// LogsPatch is intentionally omitted — logs are immutable (GIIS Control 6.10.1)
export interface LogsParams extends MongoDBAdapterParams<LogsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class LogsService<ServiceParams extends Params = LogsParams> extends MongoDBService<
  Logs,
  LogsData,
  LogsParams,
  never
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('logs'))
      .then((collection) => {
        // Auditoría: se consulta por dueño (userId) y por paciente (patientId).
        collection.createIndex({ userId: 1 })
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
