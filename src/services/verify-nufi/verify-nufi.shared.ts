import type { ClientApplication } from '../../client'

export interface VerifyNufiData {
  frontImg: string
  reverseImg: string
  faceImg: string
}

export interface VerifyNufiResult {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp: string
  sexo: 'Masculino' | 'Femenino' | 'Intersexual'
  fechaNacimiento: string
  estadoDomicilio: string
  municipioDomicilio: string
  calle: string
  colonia: string
  localidad: string
  codigoPostal: string
  vigencia: string
  model: string
  mrz: string
}

export const verifyNufiPath = 'verify-nufi'
export const verifyNufiMethods: Array<'create'> = ['create']

export const verifyNufiClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(verifyNufiPath, connection.service(verifyNufiPath), {
    methods: verifyNufiMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [verifyNufiPath]: any
  }
}
