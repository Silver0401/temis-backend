// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesPatch,
  CatalogoAfiliacionesQuery
} from './catalogo-afiliaciones.schema'

export type {
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesPatch,
  CatalogoAfiliacionesQuery
}

export interface CatalogoAfiliacionesParams extends MongoDBAdapterParams<CatalogoAfiliacionesQuery> {}

export class CatalogoAfiliacionesService<
  ServiceParams extends Params = CatalogoAfiliacionesParams
> extends MongoDBService<
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesParams,
  CatalogoAfiliacionesPatch
> {
  // @ts-ignore
  async get(_id: string, _params?: ServiceParams): Promise<CatalogoAfiliaciones[]> {
    return await this.find({
      paginate: false,
      query: {},
      pipeline: [
        { $match: { VIGENTE: 1 } },
        { $sort: { CATALOG_KEY: 1 } }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-afiliaciones'))
  }
}
