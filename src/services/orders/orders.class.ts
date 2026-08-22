// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Orders, OrdersData, OrdersPatch, OrdersQuery } from './orders.schema'

export type { Orders, OrdersData, OrdersPatch, OrdersQuery }

export interface OrdersParams extends MongoDBAdapterParams<OrdersQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class OrdersService<ServiceParams extends Params = OrdersParams> extends MongoDBService<
  Orders,
  OrdersData,
  OrdersParams,
  OrdersPatch
> {
  // @ts-ignore
  async get(id: Id, _params?: OrdersParams): Promise<Orders[]> {
    let OrdersFound: any = []

    // Si incluye el Separador es porque Buscamos Labs asociados a Diagnóstico
    if (id.includes('~')) {
      const patientId = id.split('~')[0].trim()
      const dxId = id.split('~')[1].trim()

      // Get all Patient Labs or All Labs with a Certain Diagnosis
      OrdersFound = await this.find({
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
      OrdersFound = await this.find({
        query: {
          patientId: id
        },
        // @ts-ignore
        $sort: {
          _id: -1
        }
      })
    }

    return OrdersFound.data
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('orders'))
      .then((collection) => {
        collection.createIndex({ patientId: 1 })
        return collection
      })
  }
}
