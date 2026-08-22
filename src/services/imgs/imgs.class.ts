// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Id, Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Imgs, ImgsData, ImgsPatch, ImgsQuery } from './imgs.schema'

export type { Imgs, ImgsData, ImgsPatch, ImgsQuery }

export interface ImgsParams extends MongoDBAdapterParams<ImgsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ImgsService<ServiceParams extends Params = ImgsParams> extends MongoDBService<
  Imgs,
  ImgsData,
  ImgsParams,
  ImgsPatch
> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<Imgs[]> {
    let ImgsFound: any = []

    // Si incluye el Separador es porque Buscamos Labs asociados a Diagnóstico
    if (id.includes('~')) {
      const patientId = id.split('~')[0].trim()
      const dxId = id.split('~')[1].trim()

      // Get all Patient Labs or All Labs with a Certain Diagnosis
      ImgsFound = await this.find({
        query: {
          patientId: patientId,
          diagnosisId: dxId
        },
        // @ts-ignore
        $sort: {
          _id: -1
        }
      })
    } else {
      // En caso de que no solo estamos buscando todos los Labs de un Paciente
      ImgsFound = await this.find({
        query: {
          patientId: id
        },
        // @ts-ignore
        $sort: {
          _id: -1
        }
      })
    }

    return ImgsFound.data
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('imgs'))
      .then((collection) => {
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
