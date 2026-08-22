// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'
import { GeneralError, BadRequest } from '@feathersjs/errors'
import axios from 'axios'

import type { Application } from '../../declarations'
import type {
  GoogleApiData,
  GoogleApiResult,
  GoogleApiPrediction,
  GoogleApiLocalizacion,
  GoogleApiLocalizacionEntry
} from './google-api.shared'

export type { GoogleApiData, GoogleApiResult }

export interface GoogleApiServiceOptions {
  app: Application
}

export interface GoogleApiParams extends Params {}

const PLACES_BASE = 'https://places.googleapis.com/v1'

// New Places API address component: { types: string[], longText, shortText }
interface AddressComponent {
  types?: string[]
  longText?: string
  shortText?: string
}

const pickComponent = (components: AddressComponent[], type: string, short = false): string | undefined => {
  const found = components?.find((c) => c.types?.includes(type))
  if (!found) return undefined
  return short ? found.shortText : found.longText
}

const toEntry = (nombre?: string): GoogleApiLocalizacionEntry | undefined =>
  nombre ? { id: nombre, nombre } : undefined

export class GoogleApiService<ServiceParams extends GoogleApiParams = GoogleApiParams>
  implements ServiceInterface<GoogleApiResult, GoogleApiData, ServiceParams>
{
  constructor(public options: GoogleApiServiceOptions) {}

  async create(data: GoogleApiData, _params?: ServiceParams): Promise<GoogleApiResult> {
    const apiKey = process.env.NOT_GOOGLE_API_KEY

    console.log(data)

    if (!apiKey) {
      throw new GeneralError('Buscador de direcciones no configurado')
    }

    if (data.action === 'autocomplete') {
      return this.autocomplete(data.input, data.sessionToken, apiKey)
    }
    if (data.action === 'details') {
      return this.details(data.placeId, data.sessionToken, apiKey)
    }
    throw new BadRequest('Acción inválida para google-api')
  }

  // input -> address predictions
  private async autocomplete(input: string, sessionToken: string, apiKey: string): Promise<GoogleApiResult> {
    if (!input || input.trim().length < 3) {
      return { action: 'autocomplete', predictions: [] }
    }

    const response = await axios({
      method: 'post',
      url: `${PLACES_BASE}/places:autocomplete`,
      data: {
        input,
        sessionToken,
        includedRegionCodes: ['mx'],
        languageCode: 'es'
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey
      }
    }).catch((err) => {
      console.log('GOOGLE PLACES ERROR:', JSON.stringify(err.response?.data, null, 2))
      throw new GeneralError('Error al buscar la dirección')
    })

    // console.log(response)

    const suggestions: any[] = response.data?.suggestions ?? []
    const predictions: GoogleApiPrediction[] = suggestions
      .filter((s) => s.placePrediction)
      .map((s) => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text?.text ?? ''
      }))

    return { action: 'autocomplete', predictions }
  }

  // placeId -> full address mapped to LocalizacionItem
  private async details(placeId: string, sessionToken: string, apiKey: string): Promise<GoogleApiResult> {
    if (!placeId) {
      throw new BadRequest('placeId requerido')
    }

    const response = await axios({
      method: 'get',
      url: `${PLACES_BASE}/places/${encodeURIComponent(placeId)}`,
      params: { sessionToken },
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'addressComponents,formattedAddress'
      }
    }).catch(() => {
      throw new GeneralError('No se pudieron obtener los datos de la dirección')
    })

    const comps: AddressComponent[] = response.data?.addressComponents ?? []

    const streetNumber = pickComponent(comps, 'street_number')
    const route = pickComponent(comps, 'route')
    const calle = [route, streetNumber].filter(Boolean).join(' ') || undefined
    const colonia =
      pickComponent(comps, 'sublocality_level_1') ||
      pickComponent(comps, 'sublocality') ||
      pickComponent(comps, 'neighborhood')
    const municipio = pickComponent(comps, 'locality') || pickComponent(comps, 'administrative_area_level_2')
    const estado = pickComponent(comps, 'administrative_area_level_1')
    const pais = pickComponent(comps, 'country')
    const codigoPostal = pickComponent(comps, 'postal_code')

    // Google carries no GIIS catalogKeys; entries hold name only. Birth-place
    // inputs keep the official catalogs on the front.
    const localizacion: GoogleApiLocalizacion = {
      pais: toEntry(pais),
      estado: toEntry(estado),
      municipio: toEntry(municipio),
      localidad: toEntry(colonia),
      calle,
      colonia,
      codigoPostal,
      formattedAddress: response.data?.formattedAddress
    }

    return { action: 'details', ...localizacion }
  }
}

export const getOptions = (app: Application): GoogleApiServiceOptions => {
  return { app }
}
