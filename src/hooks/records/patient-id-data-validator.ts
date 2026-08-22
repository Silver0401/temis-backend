import { BadRequest } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

interface GIISValidationError {
  field: string
  message: string
  section: string
}

const CURP_GENERICO = 'XXXX999999XXXXXX99'
const CURP_REGEX = /^[A-Z]{4}\d{6}[HMX][A-Z]{2}[BCDFGHJKLMNÑPQRSTVWXYZ]{3}[A-Z\d]\d$/
const NOMBRE_CHARS_REGEX = /^[A-ZÑ\s\-,./'¨]+$/
const CONSECUTIVE_SPECIAL_REGEX = /[\-,./'¨]{2,}/

// Strings que la IA devuelve cuando no puede extraer el dato real
const PLACEHOLDERS = new Set([
  'undefined',
  'null',
  'n/a',
  'na',
  'no disponible',
  'desconocido',
  'desconocida',
  'no aplica',
  'sin dato',
  'sin nombre',
  'sin apellido',
  'no encontrado',
  '--',
  '-',
  '?',
  'ninguno',
  'ninguna',
  'none',
  'not specified',
  'unknown'
])

// Catálogo GIIS B015 variable #22 — valores exactos aceptados
const GENEROS_VALIDOS = new Set([
  'masculino',
  'femenino',
  'transgénero',
  'transgenero',
  'transexual',
  'travesti',
  'intersexual',
  'otro',
  'no especificado'
])

function esPlaceholder(valor: string): boolean {
  return PLACEHOLDERS.has(valor.trim().toLowerCase())
}

function normalizarNombre(valor: string): string {
  return valor
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U')
}

function validarNombreApellido(valor: string): string | null {
  const trimmed = valor.trim()
  if (trimmed !== valor) return 'No debe tener espacios al inicio ni al final'
  if (esPlaceholder(trimmed)) return 'El valor parece un marcador genérico; proporciona el dato real'
  if (/\s{2,}/.test(trimmed)) return 'No se permite más de un espacio consecutivo'
  if (!NOMBRE_CHARS_REGEX.test(normalizarNombre(trimmed)))
    return "Solo se permiten letras A-Z, Ñ en mayúsculas y los caracteres: - , . / ' ¨"
  if (CONSECUTIVE_SPECIAL_REGEX.test(trimmed)) return 'No se permite más de un carácter especial consecutivo'
  return null
}

export const patientIdDataValidator = async (context: HookContext) => {
  const errors: GIISValidationError[] = []
  const section = 'Identificación del Paciente'

  // Funciona tanto desde patients.create (context.data) como desde records
  // (context.params.patientData, seteado por record_doc_type.ts en la rama de
  // paciente nuevo). Si no hay patientData, cae a context.data (patients.create
  // directo o external-patient-registration).
  const patient = context.params.patientData ?? context.data

  if (!patient?.personalInfo) return context

  const info = patient.personalInfo

  // CURP: genérico SOLO cuando es el valor oficial o empieza con XXXX explícitamente
  const curpRaw: string = (info.curp ?? '').trim()
  const curpGenerico = curpRaw === CURP_GENERICO

  // --- Validaciones que aplican siempre ---

  if (!info.sex || !['Masculino', 'Femenino', 'Intersexual'].includes(info.sex)) {
    errors.push({
      field: 'sexoCURP',
      message: 'El sexo biológico del paciente es requerido (Masculino, Femenino o Intersexual)',
      section
    })
  }

  const genreRaw: string = (info.genre ?? '').trim()
  if (!genreRaw || esPlaceholder(genreRaw)) {
    errors.push({ field: 'genero', message: 'El género del paciente es requerido', section })
  } else if (!GENEROS_VALIDOS.has(genreRaw.toLowerCase())) {
    errors.push({
      field: 'genero',
      message: `Género "${genreRaw}" no válido; debe ser: Masculino, Femenino, Transgénero, Transexual, Travesti, Intersexual, Otro o No Especificado`,
      section
    })
  }

  // Derechohabiencia es multi-valor: Afiliacion[] con { catalogKey, descripcion }.
  const afiliaciones: Array<{ catalogKey?: number; descripcion?: string }> = Array.isArray(
    info.derechohabiencia
  )
    ? info.derechohabiencia
    : []
  if (afiliaciones.length === 0) {
    errors.push({ field: 'derechohabiencia', message: 'La derechohabiencia es requerida', section })
  } else {
    // "Sin derechohabiencia / se ignora" (NINGUNA, SE IGNORA, DESCONOCE, NO APLICA,
    // NO ESPECIFICADO) es excluyente: no puede combinarse entre sí ni con una
    // afiliación real. El frontend ya lo impide en la UI; esto lo revalida en servidor.
    const EXCLUSIVE_PATTERNS = ['NINGUN', 'IGNORA', 'DESCONOCE', 'NO APLICA', 'ESPECIFICADO']
    const isExclusive = (descripcion: string) => {
      const norm = descripcion
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
      return EXCLUSIVE_PATTERNS.some((p) => norm.includes(p))
    }
    const exclusiveCount = afiliaciones.filter((a) => isExclusive(a.descripcion ?? '')).length
    if (exclusiveCount > 0 && afiliaciones.length > 1) {
      errors.push({
        field: 'derechohabiencia',
        message: 'No se puede combinar "sin derechohabiencia / se ignora" con otra afiliación',
        section
      })
    }
  }
  if (afiliaciones.length > 0) {
    // Las entradas elegidas del catálogo llevan catalogKey > 0 (ya válidas).
    // Solo validamos las de texto libre (catalogKey <= 0) contra el catálogo.
    const freeText = afiliaciones.filter((a) => !(a.catalogKey && a.catalogKey > 0))
    for (const afiliacion of freeText) {
      const descripcion = (afiliacion.descripcion ?? '').trim()
      if (!descripcion || esPlaceholder(descripcion)) {
        errors.push({ field: 'derechohabiencia', message: 'La derechohabiencia es requerida', section })
        continue
      }
      const derechoEscaped = descripcion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = (await context.app.service('catalogo-afiliaciones').find({
        paginate: false,
        query: {},
        pipeline: [
          {
            $match: {
              $or: [
                { 'DESCRIPCIÓN CORTA': { $regex: derechoEscaped, $options: 'i' } },
                { 'DESCRIPCIÓN LARGA': { $regex: derechoEscaped, $options: 'i' } }
              ]
            }
          },
          { $limit: 1 }
        ]
      })) as any[]

      if (!matches?.length) {
        const allAfiliaciones = (await context.app.service('catalogo-afiliaciones').find({
          paginate: false,
          query: {},
          pipeline: [{ $sort: { CATALOG_KEY: 1 } }, { $project: { 'DESCRIPCIÓN CORTA': 1, _id: 0 } }]
        })) as any[]

        const validValues = allAfiliaciones
          .map((e: any) => e['DESCRIPCIÓN CORTA'])
          .filter(Boolean)
          .join(', ')

        errors.push({
          field: 'derechohabiencia',
          message: `Derechohabiencia "${descripcion}" no válida; debe ser: ${validValues}`,
          section
        })
      }
    }
  }

  const birthPlaceRaw: string = (info.birthPlace ?? '').trim()
  if (!birthPlaceRaw || esPlaceholder(birthPlaceRaw)) {
    errors.push({ field: 'lugarNacimiento', message: 'El lugar de nacimiento es requerido', section })
  }

  const nacimiento = patient.localizacion?.nacimiento
  if (!nacimiento?.pais?.id || nacimiento.pais.catalogKey === undefined) {
    errors.push({
      field: 'paisNacPaciente',
      message: 'Selecciona el país de nacimiento desde el catálogo',
      section
    })
  }
  const paisNombre = (nacimiento?.pais?.nombre ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const nacimientoEnMexico = nacimiento?.pais?.catalogKey === 142 || /mexico/i.test(paisNombre)
  if (nacimientoEnMexico && (!nacimiento?.estado?.id || nacimiento.estado.catalogKey === undefined)) {
    errors.push({
      field: 'entidadNacimiento',
      message: 'Selecciona la entidad federativa de nacimiento desde el catálogo',
      section
    })
  }

  // --- GIIS campos 18-21: autoadscripción, migración y país de procedencia ---
  const VALORES_18_19 = new Set([0, 1, 2, 3, -1])
  const VALORES_20 = new Set([0, 1, 2, 3, -1])

  if (info.seAutodenominaAfromexicano === undefined || !VALORES_18_19.has(info.seAutodenominaAfromexicano)) {
    errors.push({
      field: 'seAutodenominaAfromexicano',
      message:
        'Valor inválido para "¿Se autodenomina afromexicano?" (0=No, 1=Sí, 2=No responde, 3=No sabe, -1=Se desconoce)',
      section
    })
  }
  if (info.seConsideraIndigena === undefined || !VALORES_18_19.has(info.seConsideraIndigena)) {
    errors.push({
      field: 'seConsideraIndigena',
      message:
        'Valor inválido para "¿Se considera indígena?" (0=No, 1=Sí, 2=No responde, 3=No sabe, -1=Se desconoce)',
      section
    })
  }
  if (info.migrante === undefined || !VALORES_20.has(info.migrante)) {
    errors.push({
      field: 'migrante',
      message:
        'Valor inválido para condición migratoria (0=No, 1=Nacional, 2=Internacional, 3=Retornado, -1=Se desconoce)',
      section
    })
  } else {
    // Regla de derivación de paisProcedencia (GIIS campo 21):
    // migrante=2 (Internacional) -> catalogKey del país, distinto de 142 (México)
    // migrante=1 o 3 (Nacional/Retornado) -> 142
    // migrante=0 o -1 -> -1
    const pp = info.paisProcedencia
    if (info.migrante === 2) {
      if (pp === undefined || pp === 142) {
        errors.push({
          field: 'paisProcedencia',
          message:
            'Selecciona un país de procedencia distinto de México cuando la migración es internacional',
          section
        })
      }
    } else if (info.migrante === 1 || info.migrante === 3) {
      if (pp !== 142) {
        errors.push({
          field: 'paisProcedencia',
          message:
            'El país de procedencia debe ser México (142) cuando la migración es nacional o de retorno',
          section
        })
      }
    } else if (info.migrante === 0 || info.migrante === -1) {
      if (pp !== -1) {
        errors.push({
          field: 'paisProcedencia',
          message: 'El país de procedencia debe ser "se desconoce" (-1) cuando no hay condición migratoria',
          section
        })
      }
    }
  }

  // --- Validación CURP ---
  if (!curpRaw || esPlaceholder(curpRaw)) {
    errors.push({
      field: 'curpPaciente',
      message: `La CURP es requerida; usa "${CURP_GENERICO}" si no está disponible`,
      section
    })
  } else if (!curpGenerico) {
    if (curpRaw.length !== 18) {
      errors.push({
        field: 'curpPaciente',
        message: `La CURP debe tener exactamente 18 caracteres (tiene ${curpRaw.length})`,
        section
      })
    } else if (!CURP_REGEX.test(curpRaw)) {
      errors.push({
        field: 'curpPaciente',
        message: 'La CURP no tiene el formato válido RENAPO',
        section
      })
    }
  }

  // --- Validaciones de nombre/apellido/fecha/entidad ---
  // Se omiten cuando CURP es genérico (GIIS B015): el paciente no tiene CURP registrado
  if (!curpGenerico) {
    const nombre: string = (info.names ?? '').trim()
    if (!nombre || esPlaceholder(nombre) || nombre.length < 2 || nombre.length > 50) {
      errors.push({ field: 'nombre', message: 'El nombre debe tener entre 2 y 50 caracteres', section })
    } else {
      const charError = validarNombreApellido(nombre)
      if (charError) errors.push({ field: 'nombre', message: charError, section })
    }

    const primerApellido: string = (info.middleName ?? '').trim()
    if (!primerApellido || esPlaceholder(primerApellido)) {
      errors.push({
        field: 'primerApellido',
        message: 'El primer apellido es requerido (o "XX" si no aplica)',
        section
      })
    } else if (primerApellido !== 'XX') {
      if (primerApellido.length < 2 || primerApellido.length > 50) {
        errors.push({
          field: 'primerApellido',
          message: 'El primer apellido debe tener entre 2 y 50 caracteres',
          section
        })
      } else {
        const charError = validarNombreApellido(primerApellido)
        if (charError) errors.push({ field: 'primerApellido', message: charError, section })
      }
    }

    const segundoApellido: string = (info.lastName ?? '').trim()
    if (!segundoApellido || esPlaceholder(segundoApellido)) {
      errors.push({
        field: 'segundoApellido',
        message: 'El segundo apellido es requerido (o "XX" si no aplica)',
        section
      })
    } else if (segundoApellido !== 'XX') {
      if (segundoApellido.length < 2 || segundoApellido.length > 50) {
        errors.push({
          field: 'segundoApellido',
          message: 'El segundo apellido debe tener entre 2 y 50 caracteres',
          section
        })
      } else {
        const charError = validarNombreApellido(segundoApellido)
        if (charError) errors.push({ field: 'segundoApellido', message: charError, section })
      }
    }

    const fechaNac: string = (info.birthDate ?? '').trim()
    if (!fechaNac || esPlaceholder(fechaNac)) {
      errors.push({ field: 'fechaNacimiento', message: 'La fecha de nacimiento es requerida', section })
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      if (!dateRegex.test(fechaNac)) {
        errors.push({
          field: 'fechaNacimiento',
          message: 'La fecha de nacimiento debe tener formato DD/MM/AAAA',
          section
        })
      } else {
        const [day, month, year] = fechaNac.split('/').map(Number)
        const birthDate = new Date(year, month - 1, day)
        const now = new Date()
        const realDate =
          birthDate.getFullYear() === year &&
          birthDate.getMonth() === month - 1 &&
          birthDate.getDate() === day
        const oldestAllowed = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
        if (!realDate) {
          errors.push({
            field: 'fechaNacimiento',
            message: 'La fecha de nacimiento no existe',
            section
          })
        } else if (birthDate > now) {
          errors.push({
            field: 'fechaNacimiento',
            message: 'La fecha de nacimiento no puede ser futura',
            section
          })
        } else if (birthDate < oldestAllowed) {
          errors.push({
            field: 'fechaNacimiento',
            message: 'La edad calculada supera 120 años, verifica la fecha',
            section
          })
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new BadRequest('Información del paciente incompleta (NOM-024)', { errors })
  }

  return context
}
