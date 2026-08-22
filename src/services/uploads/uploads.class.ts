// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import type { Application } from '../../declarations'
import type { Uploads, UploadsData, UploadsPatch, UploadsQuery } from './uploads.schema'
import { GeneralError } from '@feathersjs/errors'
import { app } from '../../app'
import axios from 'axios'

export type { Uploads, UploadsData, UploadsPatch, UploadsQuery }

export interface UploadsServiceOptions {
  app: Application
}

export interface UploadsParams extends Params<UploadsQuery> {}

/**
 * Servicio de subida de archivos.
 *
 * Sólo quedan las rutas deterministas: validación de identidad contra NUFI/RENAPO
 * (INE y CURP) y el reenvío de imágenes tomadas desde el teléfono.
 *
 * La purga de Temis eliminó las acciones que dependían de OCR o de un modelo de
 * lenguaje (`newPatient`, `AIImgExtraction`, `OCRextraction`): sintetizaban la
 * historia clínica a partir de PDFs o fotos, y en Temis la captura es siempre
 * manual y estructurada.
 */
export class UploadsService<ServiceParams extends UploadsParams = UploadsParams>
  implements ServiceInterface<Uploads, UploadsData, ServiceParams, UploadsPatch>
{
  constructor(public options: UploadsServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Uploads[]> {
    return []
  }

  async get(_id: Id, params?: ServiceParams): Promise<Uploads> {
    return {
      FileList: [''],
      Type: 'file',
      Action: 'INEextraction',
      Description: ''
    }
  }

  async create(data: UploadsData, params?: ServiceParams): Promise<Uploads>
  async create(data: UploadsData, params?: ServiceParams): Promise<Uploads | Uploads[]> {
    const ExtractINEData = async (): Promise<any> => {
      try {
        const NufiResponse = await axios({
          method: 'post',
          url: 'https://nufi.azure-api.net/ocr/v4/frente',
          data: { base64_credencial_frente: data.FileList[0] },
          headers: {
            'Content-Type': 'application/json',
            'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
          }
        })

        return NufiResponse.data
      } catch (err: any) {
        console.log(err)
        throw new GeneralError('INE no procesada, revisa la calidad de la imágen')
      }
    }

    const CURPExtractRenapo = async (): Promise<any> => {
      try {
        const response = await axios({
          method: 'post',
          url: 'https://nufi.azure-api.net/curp/v1/consulta',
          data: {
            tipo_busqueda: 'curp',
            curp: data.FileList[0]
          },
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.NOT_NUFI_AI_KEY
          }
        })

        return response.data
      } catch (err: any) {
        console.log(err)
        throw new GeneralError('CURP no encontrado, revisa el texto')
      }
    }

    if (data.Action === 'CURPRenapo') {
      return {
        ...data,
        Response: await CURPExtractRenapo()
      }
    }

    if (data.Type === 'image') {
      switch (data.Action) {
        case 'INEextraction':
          return {
            ...data,
            Response: await ExtractINEData()
          }
        case 'phoneUpload':
          app.service('uploads').emit('ImgSent', {
            base64File: data.FileList[0],
            name: data.Description,
            userId: params?.user?._id
          })
          break
        default:
          throw new GeneralError('Acción no permitida')
      }
    } else {
      throw new GeneralError('Acción no permitida')
    }

    return {
      FileList: data.FileList,
      Type: data.Type,
      Action: data.Action,
      Description: data.Description
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: UploadsData, _params?: ServiceParams): Promise<Uploads> {
    return {
      FileList: data.FileList,
      Type: data.Type,
      Action: data.Action,
      Description: data.Description
    }
  }

  async patch(id: NullableId, data: UploadsPatch, _params?: ServiceParams): Promise<Uploads> {
    return {
      FileList: [''],
      Type: 'file',
      Action: 'INEextraction',
      Description: ''
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Uploads> {
    return {
      FileList: [''],
      Type: 'file',
      Action: 'INEextraction',
      Description: ''
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
