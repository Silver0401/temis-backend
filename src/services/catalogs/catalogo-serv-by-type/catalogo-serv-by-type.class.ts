// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoServByType,
  CatalogoServByTypeData,
  CatalogoServByTypePatch,
  CatalogoServByTypeQuery
} from './catalogo-serv-by-type.schema'

export type { CatalogoServByType, CatalogoServByTypeData, CatalogoServByTypePatch, CatalogoServByTypeQuery }

export interface CatalogoServByTypeParams extends MongoDBAdapterParams<CatalogoServByTypeQuery> {}

export class CatalogoServByTypeService<
  ServiceParams extends Params = CatalogoServByTypeParams
> extends MongoDBService<
  CatalogoServByType,
  CatalogoServByTypeData,
  CatalogoServByTypeParams,
  CatalogoServByTypePatch
> {
  // @ts-ignore
  async get(_id: string, _params?: ServiceParams): Promise<CatalogoServByType[]> {
    return await this.find({
      paginate: false,
      query: {},
      pipeline: [
        { $sort: { CATALOG_KEY: 1 } }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-serv-by-type'))
  }
}
