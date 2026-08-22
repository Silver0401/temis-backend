// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoMunicipios,
  CatalogoMunicipiosData,
  CatalogoMunicipiosPatch,
  CatalogoMunicipiosQuery
} from './catalogo-municipios.schema'

export type { CatalogoMunicipios, CatalogoMunicipiosData, CatalogoMunicipiosPatch, CatalogoMunicipiosQuery }

export interface CatalogoMunicipiosParams extends MongoDBAdapterParams<CatalogoMunicipiosQuery> {}

export class CatalogoMunicipiosService<
  ServiceParams extends Params = CatalogoMunicipiosParams
> extends MongoDBService<
  CatalogoMunicipios,
  CatalogoMunicipiosData,
  CatalogoMunicipiosParams,
  CatalogoMunicipiosPatch
> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoMunicipios[]> {
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
    const isNumeric = /^\d+$/.test(filteredString.trim())
    const query = _params?.query as Record<string, any> | undefined
    const efeKey = query?.EFE_KEY !== undefined ? Number(query.EFE_KEY) : undefined

    const matchStage = isNumeric
      ? { CATALOG_KEY: Number(filteredString) }
      : {
          MUNICIPIO: { $regex: buildAccentInsensitivePattern(filteredString), $options: 'i' },
          ...(efeKey !== undefined && { EFE_KEY: efeKey })
        }

    return await this.find({
      paginate: false,
      query: {},
      pipeline: [
        { $match: matchStage },
        { $limit: 25 }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-municipios'))
  }
}
