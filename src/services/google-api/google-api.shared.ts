import type { ClientApplication } from '../../client'
import type { GoogleApiService } from './google-api.class'

// ── Request payloads ──────────────────────────────────────────────────────
// Discriminated by `action`:
//  - autocomplete: free-text query -> address predictions
//  - details:      placeId -> full address mapped to LocalizacionItem
export interface GoogleApiAutocompleteData {
  action: 'autocomplete'
  input: string
  sessionToken: string
}

export interface GoogleApiDetailsData {
  action: 'details'
  placeId: string
  sessionToken: string
}

export type GoogleApiData = GoogleApiAutocompleteData | GoogleApiDetailsData

// ── Result shapes ─────────────────────────────────────────────────────────
export interface GoogleApiPrediction {
  placeId: string
  description: string
}

export interface GoogleApiLocalizacionEntry {
  id: string
  nombre: string
}

// Mirrors the front `LocalizacionItem` (sans GIIS catalogKeys — Google has none).
export interface GoogleApiLocalizacion {
  pais?: GoogleApiLocalizacionEntry
  estado?: GoogleApiLocalizacionEntry
  municipio?: GoogleApiLocalizacionEntry
  localidad?: GoogleApiLocalizacionEntry
  calle?: string
  colonia?: string
  codigoPostal?: string
  formattedAddress?: string
}

export type GoogleApiResult =
  | { action: 'autocomplete'; predictions: GoogleApiPrediction[] }
  | ({ action: 'details' } & GoogleApiLocalizacion)

export const googleApiPath = 'google-api'
export const googleApiMethods: Array<'create'> = ['create']

export const googleApiClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(googleApiPath, connection.service(googleApiPath), {
    methods: googleApiMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [googleApiPath]: GoogleApiService
  }
}
