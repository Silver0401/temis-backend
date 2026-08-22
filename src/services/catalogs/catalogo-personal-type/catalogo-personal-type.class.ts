// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypePatch,
  CatalogoPersonalTypeQuery
} from './catalogo-personal-type.schema'

export type {
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypePatch,
  CatalogoPersonalTypeQuery
}

export interface CatalogoPersonalTypeParams extends MongoDBAdapterParams<CatalogoPersonalTypeQuery> {}

export class CatalogoPersonalTypeService<
  ServiceParams extends Params = CatalogoPersonalTypeParams
> extends MongoDBService<
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypeParams,
  CatalogoPersonalTypePatch
> {
  // @ts-ignore
  async get(_id: string, _params?: ServiceParams): Promise<CatalogoPersonalType[]> {
    const results = await this.find({
      paginate: false,
      query: {},
      pipeline: [{ $match: { CATALOG_KEY: { $gte: 1, $lte: 4 } } }, { $sort: { CATALOG_KEY: 1 } }]
    })

    return results as CatalogoPersonalType[]
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-personal-type'))
  }
}
