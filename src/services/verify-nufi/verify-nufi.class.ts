import type { Params, ServiceInterface } from '@feathersjs/feathers'
import { GeneralError } from '@feathersjs/errors'
import axios, { AxiosResponse } from 'axios'
import type { Application } from '../../declarations'
import type { VerifyNufiData, VerifyNufiResult } from './verify-nufi.shared'

interface INE_OCR_data_props {
  front: FrontProps
  back: BackProps
}

interface MRZProps {
  tipo_identificacion?: string
  cic?: string
  identificador_del_ciudadano?: string
  ocr?: string
  clave_de_elector?: string
  numero_de_emision?: string
}

export interface VerifyNufiServiceOptions {
  app: Application
}

export interface VerifyNufiParams extends Params {}

export class VerifyNufiService<ServiceParams extends VerifyNufiParams = VerifyNufiParams>
  implements ServiceInterface<VerifyNufiResult, VerifyNufiData, ServiceParams>
{
  constructor(public options: VerifyNufiServiceOptions) {}

  async create(data: VerifyNufiData, _params?: ServiceParams): Promise<VerifyNufiResult> {
    if (process.env.ENV_TYPE !== 'production') {
      return {
        nombre: 'ISMAEL',
        apellidoPaterno: 'MUÑOZ',
        apellidoMaterno: 'CONTRERAS',
        curp: 'MUCI990101HNLNRSA4',
        sexo: 'Masculino',
        fechaNacimiento: '01/01/1999',
        estadoDomicilio: 'NUEVO LEON',
        municipioDomicilio: 'MONTERREY',
        calle: 'TOPACIO 208 COL. PUNTA AZUL',
        colonia: 'PUNTA AZUL',
        localidad: 'MONTERREY',
        codigoPostal: '66050',
        vigencia: '2030',
        model: 'G',
        mrz: 'TEST_MRZ_DATA'
      }
    }

    const INE_base64_photos = {
      credencial_frente: data.frontImg,
      credencial_reverso: data.reverseImg,
      imagen_rostro: data.faceImg
    }

    let INE_OCR_data: INE_OCR_data_props = { front: {}, back: {} }

    // Step 1) OCR — frente y reverso en paralelo
    const FrontINEPromise = new Promise<AxiosResponse<{ data: FrontProps }, any>>(async (resolve, _reject) => {
      resolve(
        await axios({
          method: 'post',
          url: 'https://nufi.azure-api.net/ocr/v4/frente',
          data: { base64_credencial_frente: INE_base64_photos.credencial_frente },
          headers: {
            'Content-Type': 'application/json',
            'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
          }
        })
      )
    })

    const BackINEPromise = new Promise<AxiosResponse<{ data: BackProps }, any>>(async (resolve, _reject) => {
      resolve(
        await axios({
          url: 'https://nufi.azure-api.net/ocr/v4/reverso',
          method: 'post',
          data: { base64_credencial_reverso: INE_base64_photos.credencial_reverso },
          headers: {
            'Content-Type': 'application/json',
            'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
          }
        })
      )
    })

    await Promise.all([BackINEPromise, FrontINEPromise])
      .then(([backRes, frontRes]) => {
        INE_OCR_data = {
          back: { ...backRes.data.data },
          front: { ...frontRes.data.data }
        }
      })
      .catch(() => {
        throw new GeneralError('Error extrayendo información de la INE, toma las fotos de nuevo')
      })

    if (INE_OCR_data.front.ocr?.nombre === undefined) {
      throw new GeneralError('La imagen del INE frontal salió de mala calidad, toma una foto nueva')
    }
    if (INE_OCR_data.back.ocr?.mrz === undefined) {
      throw new GeneralError('La imagen del reverso del INE salió de mala calidad, toma una foto nueva')
    }

    // Step 1.6) Lista Nominal
    const TipoDeId = INE_OCR_data.back.ocr?.model?.slice(-1)
    let INEFormatedMRZ: MRZProps = {}

    if (TipoDeId === 'C') {
      INEFormatedMRZ = {
        tipo_identificacion: TipoDeId,
        ocr: `${INE_OCR_data.back.ocr?.mrz}`,
        clave_de_elector: INE_OCR_data.front.ocr?.clave,
        numero_de_emision: INE_OCR_data.front.ocr.emision?.slice(-2)
      }
    } else if (TipoDeId === 'D') {
      INEFormatedMRZ = {
        tipo_identificacion: TipoDeId,
        cic: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[0]}`.match(/\d+/g)?.join('').substring(0, 9),
        ocr: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.split(' ')[0]
      }
    } else {
      INEFormatedMRZ = {
        tipo_identificacion: TipoDeId,
        cic: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[0]}`.match(/\d+/g)?.join('').substring(0, 9),
        identificador_del_ciudadano: INE_OCR_data.back.ocr?.mrz?.includes('<<')
          ? `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.split(' ')[0].substring(13 - 9)
          : INE_OCR_data.back.ocr?.mrz
      }
    }

    await axios({
      url: 'https://nufi.azure-api.net/v1/lista_nominal/validar',
      method: 'post',
      data: INEFormatedMRZ,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.NOT_NUFI_AI_KEY
      }
    })
      .then((response) => {
        if (!response.data.data[0].activa) {
          throw new GeneralError('INE no validada en lista Nominal')
        }
      })
      .catch(() => {
        throw new GeneralError('Error validando INE en lista Nominal')
      })

    // Step 2) Comparación biométrica
    await axios({
      url: 'https://nufi.azure-api.net/biometrico/v2/ine_vs_selfie',
      method: 'post',
      data: INE_base64_photos,
      headers: {
        'Content-Type': 'application/json',
        'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
      }
    })
      .then((response) => {
        if (!response.data.data.resultado_verificacion_rostro) {
          throw new GeneralError('Tu cara no concuerda con la de tu INE')
        }
      })
      .catch(() => {
        throw new GeneralError('Error verificando cara e INE')
      })

    const ocr = INE_OCR_data.front.ocr!

    return {
      nombre: ocr.nombre ?? '',
      apellidoPaterno: ocr.apellido_paterno ?? '',
      apellidoMaterno: ocr.apellido_materno ?? '',
      curp: ocr.curp ?? '',
      sexo: ocr.sexo?.toLowerCase().includes('h') ? 'Masculino' : 'Femenino',
      fechaNacimiento: ocr.fecha_nacimiento ?? '',
      estadoDomicilio: ocr.estado ?? '',
      municipioDomicilio: ocr.municipio ?? '',
      calle: ocr.calle_numero ?? '',
      colonia: ocr.colonia ?? '',
      localidad: ocr.localidad ?? '',
      codigoPostal: ocr.codigo_postal ?? '',
      vigencia: ocr.vigencia ?? '',
      model: INE_OCR_data.back.ocr?.model?.slice(-1) ?? '',
      mrz: INE_OCR_data.back.ocr?.mrz ?? ''
    }
  }
}

export const getOptions = (app: Application): VerifyNufiServiceOptions => {
  return { app }
}
