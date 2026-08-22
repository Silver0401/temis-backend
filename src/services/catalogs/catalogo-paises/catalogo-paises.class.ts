// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoPaises,
  CatalogoPaisesData,
  CatalogoPaisesPatch,
  CatalogoPaisesQuery
} from './catalogo-paises.schema'

export type { CatalogoPaises, CatalogoPaisesData, CatalogoPaisesPatch, CatalogoPaisesQuery }

export interface CatalogoPaisesParams extends MongoDBAdapterParams<CatalogoPaisesQuery> {}

export class CatalogoPaisesService<
  ServiceParams extends Params = CatalogoPaisesParams
> extends MongoDBService<CatalogoPaises, CatalogoPaisesData, CatalogoPaisesParams, CatalogoPaisesPatch> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoPaises[]> {
    function safeDecode(s: string) {
      try { return decodeURIComponent(s.replace(/\+/g, ' ')) } catch { return s }
    }

    function buildAccentInsensitivePattern(str: string): string {
      const accentMap: Record<string, string> = {
        a: '[aáàä]', e: '[eéèë]', i: '[iíìï]',
        o: '[oóòö]', u: '[uúùü]', n: '[nñ]'
      }
      const stripped = str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      return stripped.split('').map((c) => accentMap[c] ?? c).join('')
    }

    const filteredString = safeDecode(id)
    const pattern = buildAccentInsensitivePattern(filteredString)

    return await this.find({
      paginate: false,
      query: {},
      pipeline: [
        { $match: { DESCRIPCION: { $regex: pattern, $options: 'i' } } },
        { $limit: 25 }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-paises'))
  }
}
