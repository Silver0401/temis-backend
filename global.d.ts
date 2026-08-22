interface FrontProps {
  tipo?: string
  serie?: string
  vigente?: boolean
  figuras?: {
    fotoDerecha?: boolean
    fotoMarcaAgua?: boolean
    firma?: boolean
    escudo?: boolean
  }
  ocr?: {
    instituto?: string
    credencial?: string
    apellido_paterno?: string
    apellido_materno?: string
    nombre?: string
    fecha_nacimiento?: string
    sexo?: string
    calle_numero?: string
    codigo_postal?: string
    colonia?: string
    estado?: string
    municipio?: string
    clave?: string
    curp?: string
    anio_registro?: string
    mes_registro?: string
    registro?: string
    estado_code?: string
    municipio_code?: string
    seccion?: string
    localidad?: string
    emision?: string
    vigencia?: string
  }
  url_input?: string
  url_output?: string
  id?: string
}

interface BackProps {
  ocr?: {
    model?: string
    mrz?: string
  }
  url_input?: string
  url_output?: string
  id?: string
}

type DeviceType = 'phone' | 'computer' | 'unknown'

interface UserPresence {
  userId: string | number
  phone: boolean
  computer: boolean
}
