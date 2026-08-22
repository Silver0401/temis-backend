// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Paginated, Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Labs, LabsData, LabsPatch, LabsQuery } from './labs.schema'

export type { Labs, LabsData, LabsPatch, LabsQuery }

export interface LabsParams extends MongoDBAdapterParams<LabsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class LabsService<ServiceParams extends Params = LabsParams> extends MongoDBService<
  Labs,
  LabsData,
  LabsParams,
  LabsPatch
> {
  // @ts-ignore
  async get(id: Id, _params?: ServiceParams): Promise<Labs[]> {
    let LabsFound: any = []

    // Si incluye el Separador es porque Buscamos Labs asociados a Diagnóstico
    if (id.includes('~')) {
      const patientId = id.split('~')[0].trim()
      const dxId = id.split('~')[1].trim()

      // Get all Patient Labs or All Labs with a Certain Diagnosis
      LabsFound = await this.find({
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
      LabsFound = await this.find({
        query: {
          patientId: id
        },
        // @ts-ignore
        $sort: {
          _id: -1
        }
      })
    }

    return LabsFound.data
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('labs'))
      .then((collection) => {
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
