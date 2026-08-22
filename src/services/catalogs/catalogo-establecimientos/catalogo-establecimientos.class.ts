// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../../declarations'
import type {
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosPatch,
  CatalogoEstablecimientosQuery
} from './catalogo-establecimientos.schema'

export type {
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosPatch,
  CatalogoEstablecimientosQuery
}

export interface CatalogoEstablecimientosParams extends MongoDBAdapterParams<CatalogoEstablecimientosQuery> {}

export class CatalogoEstablecimientosService<
  ServiceParams extends Params = CatalogoEstablecimientosParams
> extends MongoDBService<
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosParams,
  CatalogoEstablecimientosPatch
> {
  // @ts-ignore
  async get(id: string, _params?: ServiceParams): Promise<CatalogoEstablecimientos[]> {
    // function safeDecode(s: string) {
    //   try {
    //     return decodeURIComponent(s.replace(/\+/g, ' '))
    //   } catch {
    //     return s
    //   }
    // }
    // const filteredString = safeDecode(id)
    // const isNumeric = /^\d+$/.test(filteredString.trim())

    // const matchStage = isNumeric
    //   ? { en_operacion: 1, id_entidad_federativa: Number(filteredString) }
    //   : {
    //       en_operacion: 1,
    //       $or: [
    //         { nombre_unidad: { $regex: filteredString, $options: 'im' } },
    //         { clues: { $regex: filteredString, $options: 'im' } }
    //       ]
    //     }

    // const results = await this.find({
    //   paginate: false,
    //   query: {},
    //   pipeline: [{ $match: matchStage }, { $limit: 50 }]
    // })

    function safeDecode(s: string) {
      try {
        // decode %20, %C3%9A, etc.
        return decodeURIComponent(s.replace(/\+/g, ' '))
      } catch {
        return s // if it's not valid encoding, keep original
      }
    }

    const filteredString = safeDecode(id)

    const results = await this.find({
      paginate: false,
      query: {}, // vacío para que AJV no te bloquee operadores
      pipeline: [
        {
          $match: {
            en_operacion: 1,
            $or: [
              { clues: { $regex: `${filteredString}`, $options: 'im' } },
              { nombre_unidad: { $regex: `${filteredString}`, $options: 'im' } }
            ]
          }
        },
        { $limit: 25 }
      ]
    })

    console.log(results)

    return results
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('catalogo-establecimientos'))
  }
}
