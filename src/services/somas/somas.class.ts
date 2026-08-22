// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Somas, SomasData, SomasPatch, SomasQuery } from './somas.schema'

export type { Somas, SomasData, SomasPatch, SomasQuery }

export interface SomasParams extends MongoDBAdapterParams<SomasQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class SomasService<ServiceParams extends Params = SomasParams> extends MongoDBService<
  Somas,
  SomasData,
  SomasParams,
  SomasPatch
> {
  // @ts-ignore
  async get(id: Id, _params?: ServiceParams): Promise<Somas[]> {
    // El id puede venir como "<patientId>~<algo>" por el separador que usan los
    // servicios hermanos; la somatometría ya no se asocia a un diagnóstico, así
    // que solo interesa la parte del paciente.
    const patientId = id.includes('~') ? id.split('~')[0].trim() : id

    const SomasFound: any = await this.find({
      query: {
        patientId
      },
      // @ts-ignore
      $sort: {
        _id: -1
      }
    })

    return SomasFound.data
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('somas'))
      .then((collection) => {
        // Toda consulta de somatometría es por paciente.
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
