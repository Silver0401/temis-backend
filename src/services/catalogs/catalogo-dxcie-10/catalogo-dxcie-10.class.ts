// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoDxcie10,
  CatalogoDxcie10Data,
  CatalogoDxcie10Patch,
  CatalogoDxcie10Query
} from './catalogo-dxcie-10.schema'

export type { CatalogoDxcie10, CatalogoDxcie10Data, CatalogoDxcie10Patch, CatalogoDxcie10Query }

export interface CatalogoDxcie10Params extends MongoDBAdapterParams<CatalogoDxcie10Query> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class CatalogoDxcie10Service<
  ServiceParams extends Params = CatalogoDxcie10Params
> extends MongoDBService<CatalogoDxcie10, CatalogoDxcie10Data, CatalogoDxcie10Params, CatalogoDxcie10Patch> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoDxcie10[]> {
    function safeDecode(s: string) {
      try {
        // decode %20, %C3%9A, etc.
        return decodeURIComponent(s.replace(/\+/g, ' '))
      } catch {
        return s // if it's not valid encoding, keep original
      }
    }

    const filteredString = safeDecode(id)

    const CiesFound = await this.find({
      paginate: false,
      query: {}, // vacío para que AJV no te bloquee operadores
      pipeline: [
        {
          $match: {
            $or: [
              { NOMBRE: { $regex: `${filteredString}`, $options: 'im' } },
              { CATALOG_KEY: { $regex: `${filteredString}`, $options: 'im' } }
            ]
          }
        },
        { $limit: 25 }
      ]
    })

    return CiesFound
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-dxcie-10'))
  }
}
