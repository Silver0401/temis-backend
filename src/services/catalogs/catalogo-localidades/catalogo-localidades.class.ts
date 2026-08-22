// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesPatch,
  CatalogoLocalidadesQuery
} from './catalogo-localidades.schema'

export type {
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesPatch,
  CatalogoLocalidadesQuery
}

export interface CatalogoLocalidadesParams extends MongoDBAdapterParams<CatalogoLocalidadesQuery> {}

export class CatalogoLocalidadesService<
  ServiceParams extends Params = CatalogoLocalidadesParams
> extends MongoDBService<
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesParams,
  CatalogoLocalidadesPatch
> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoLocalidades[]> {
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
    const munKey = query?.MUN_KEY !== undefined ? Number(query.MUN_KEY) : undefined

    const matchStage = isNumeric
      ? { MUN_KEY: Number(filteredString) }
      : {
          LOCALIDAD: { $regex: buildAccentInsensitivePattern(filteredString), $options: 'i' },
          ...(efeKey !== undefined && { EFE_KEY: efeKey }),
          ...(munKey !== undefined && { MUN_KEY: munKey })
        }

    return await this.find({
      paginate: false,
      query: {},
      pipeline: [
        { $match: matchStage },
        { $limit: 50 }
      ]
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-localidades'))
  }
}
