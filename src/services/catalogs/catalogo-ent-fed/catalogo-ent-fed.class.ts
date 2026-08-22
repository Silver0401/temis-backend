// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoEntFed,
  CatalogoEntFedData,
  CatalogoEntFedPatch,
  CatalogoEntFedQuery
} from './catalogo-ent-fed.schema'

export type { CatalogoEntFed, CatalogoEntFedData, CatalogoEntFedPatch, CatalogoEntFedQuery }

export interface CatalogoEntFedParams extends MongoDBAdapterParams<CatalogoEntFedQuery> {}

export class CatalogoEntFedService<
  ServiceParams extends Params = CatalogoEntFedParams
> extends MongoDBService<CatalogoEntFed, CatalogoEntFedData, CatalogoEntFedParams, CatalogoEntFedPatch> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoEntFed[]> {
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
        {
          $match: {
            $or: [
              { ENTIDAD_FEDERATIVA: { $regex: pattern, $options: 'i' } },
              { ABREVIATURA: { $regex: pattern, $options: 'i' } }
            ]
          }
        },
        { $limit: 25 }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-ent-fed'))
  }
}
