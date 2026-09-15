// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import type { Application } from '../../declarations'
import type { Uploads, UploadsData, UploadsPatch, UploadsQuery } from './uploads.schema'
import { GeneralError } from '@feathersjs/errors'
import { app } from '../../app'
import axios from 'axios'
import OpenAI from 'openai'

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
 * La purga de Temis eliminó `newPatient` y `OCRextraction` (síntesis de historia
 * clínica desde PDFs o fotos). `AIImgExtraction` volvió el 2026-09-15 para el alta
 * de laboratorios igual que en Cronos: extrae el texto de resultados de una foto o
 * PDF con OpenAI, y el hook `format_labs` lo estructura al guardar.
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

    // Mismo prompt que el servicio `ai` (ImgExtraction) de Cronos. Los PDF van
    // como input_file; en Cronos esa ruta caía en "Acción no permitida".
    const AIExtraction = async (): Promise<string> => {
      const b64 = data.FileList[0] ?? ''
      const isPdf = data.Type === 'file'
      const dataUrl = b64.startsWith('data:')
        ? b64
        : `data:${isPdf ? 'application/pdf' : 'image/jpeg'};base64,${b64}`
      try {
        const openai = new OpenAI({ apiKey: process.env.NOT_OPEN_AI_KEY })
        const completion = await openai.responses.create({
          model: 'gpt-4o',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: 'Te voy a pasar un reporte de resultados o valores (puede ser de laboratorios o somatométricos). Tu trabajo es extraer la información y regresarla en el siguiente formato -> Hemoglobina: 12.5, Leucocitos: 8.7, Plaquetas: 250, etc.'
                },
                isPdf
                  ? { type: 'input_file', filename: 'laboratorios.pdf', file_data: dataUrl }
                  : { type: 'input_image', detail: 'auto', image_url: dataUrl }
              ]
            }
          ]
        })
        return completion.output_text
      } catch (err: any) {
        console.log(err)
        throw new GeneralError('No se pudo leer el archivo, intenta con otra imagen o PDF')
      }
    }

    if (data.Action === 'AIImgExtraction') {
      return {
        ...data,
        Response: await AIExtraction()
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
