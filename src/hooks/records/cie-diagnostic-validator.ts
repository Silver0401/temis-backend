import { BadRequest } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

interface GIISValidationError {
  field: string
  message: string
  section: string
}

function calcularEdad(birthDate: string | undefined): number {
  if (!birthDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) return -1
  const [day, month, year] = birthDate.split('/').map(Number)
  const birth = new Date(year, month - 1, day)
  const now = new Date()
  return (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
}

/** Un límite de edad del catálogo, con su unidad original. */
interface LimiteEdad {
  /** Valor convertido a años, para comparar contra la edad del paciente. */
  anios: number
  /** Texto en la unidad en que lo expresa el catálogo, para el mensaje de error. */
  etiqueta: string
}

const UNIDADES: Record<string, { enAnios: number; singular: string; plural: string }> = {
  A: { enAnios: 1, singular: 'año', plural: 'años' },
  M: { enAnios: 1 / 12, singular: 'mes', plural: 'meses' },
  D: { enAnios: 1 / 365.25, singular: 'día', plural: 'días' },
  H: { enAnios: 1 / (365.25 * 24), singular: 'hora', plural: 'horas' }
}

/**
 * Parsea un límite de edad del catálogo DIAGNOSTICO_SIS.
 *
 * El formato es tres dígitos + una letra de unidad: '020A' son 20 años, '028D'
 * 28 días, '006M' 6 meses, '000H' 0 horas. 'NO' o ausente = sin restricción.
 *
 * Antes esto hacía `parseInt(valor)` y trataba el número como años sin mirar la
 * letra, así que '028D' se leía como 28 AÑOS: la tuberculosis pulmonar, que
 * aplica desde los 28 días de vida, se rechazaba en todo paciente menor de 28
 * años. En el catálogo hay 529 diagnósticos con límites en días, 341 en meses y
 * 429 en horas — casi todos pediátricos y neonatales.
 */
function parsearLimiteEdad(valor: string | undefined): LimiteEdad | null {
  if (!valor || valor === 'NO') return null

  const match = String(valor)
    .trim()
    .match(/^(\d+)\s*([A-Za-z]?)$/)
  if (!match) return null

  const cantidad = parseInt(match[1], 10)
  if (isNaN(cantidad)) return null

  // Sin letra se asume años, que es como venía el formato histórico.
  const unidad = UNIDADES[match[2].toUpperCase()] ?? UNIDADES.A

  return {
    anios: cantidad * unidad.enAnios,
    etiqueta: `${cantidad} ${cantidad === 1 ? unidad.singular : unidad.plural}`
  }
}

/** Edad del paciente en la misma unidad del límite, para el mensaje de error. */
function describirEdad(ageYears: number): string {
  if (ageYears >= 1) {
    const anios = Math.floor(ageYears)
    return `${anios} ${anios === 1 ? 'año' : 'años'}`
  }
  const meses = Math.floor(ageYears * 12)
  if (meses >= 1) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const dias = Math.floor(ageYears * 365.25)
  return `${dias} ${dias === 1 ? 'día' : 'días'}`
}

/**
 * PASO 3 del alta: valida los diagnósticos CIE contra el catálogo
 * DIAGNOSTICO_SIS — formato de 4 caracteres, restricciones por sexo (LSEX) y
 * por edad (LINF/LSUP), y confirmación obligatoria de crónicas y cáncer
 * infantil. Sin diagnósticos capturados no hay nada que validar.
 *
 * Relee el catálogo por `CATALOG_KEY`: el objeto que manda el cliente en
 * `diagnosisCatalog` sirve para rutear, nunca para validar.
 */
export const cieDiagnosticValidator = async (context: HookContext) => {
  const errors: GIISValidationError[] = []
  const sectionDx = 'Diagnósticos'

  const diagnosis: any[] = context.data.Diagnosis ?? []

  console.log(diagnosis)

  if (diagnosis.length === 0) return context

  const info = context.params.patientData?.personalInfo
  const ageYears = calcularEdad(info?.birthDate)
  const patientSex: string | undefined = info?.sex

  // No se registran context.params.patientData ni info: contienen PII del paciente.

  const relacionTemporal: string = context.data.Temporality ?? 'Subsecuente'

  // Solo validamos los primeros 3 diagnósticos (límite GIIS)
  const dxToValidate = diagnosis.slice(0, 3)

  for (const [i, dx] of dxToValidate.entries()) {
    const fieldNum = i + 1
    const cieCode: string = (dx.CIE ?? '').trim()

    // --- Formato del código ---
    if (!cieCode || cieCode.length !== 4) {
      errors.push({
        field: `codigoCIEDiagnostico${fieldNum}`,
        message: `El código CIE "${cieCode}" del diagnóstico "${dx.Name}" debe tener exactamente 4 caracteres`,
        section: sectionDx
      })
      continue
    }

    // R69X no puede ser el diagnóstico principal
    if (i === 0 && cieCode === 'R69X') {
      errors.push({
        field: `codigoCIEDiagnostico${fieldNum}`,
        message: 'R69X (causa desconocida) no puede ser el diagnóstico principal; especifica el diagnóstico',
        section: sectionDx
      })
    }

    // --- Query exacto al catálogo ---
    let catalogEntry: any
    try {
      const results = await context.app.service('catalogo-dxcie-10').find({
        query: { CATALOG_KEY: cieCode },
        paginate: false
      } as any)
      const arr = Array.isArray(results) ? results : ((results as any).data ?? [])
      catalogEntry = arr[0]
    } catch {
      // Si el servicio falla, seguimos sin bloquear
    }

    if (!catalogEntry) {
      errors.push({
        field: `codigoCIEDiagnostico${fieldNum}`,
        message: `El código "${cieCode}" (${dx.Name}) no existe en el catálogo DIAGNOSTICO_SIS`,
        section: sectionDx
      })
      continue
    }

    // --- Restricción de sexo (LSEX) ---
    // Valores del catálogo: "HOMBRE" | "MUJER" | "NO" (sin restricción)
    const lsex: string | undefined = catalogEntry.LSEX

    console.log(lsex)
    console.log(patientSex)

    // Intersexual: la guía sólo restringe por edad cuando sexoBiologico es 3.
    if (lsex && lsex !== 'NO' && patientSex && patientSex !== 'Intersexual') {
      const expectedSex = lsex === 'HOMBRE' ? 'Masculino' : 'Femenino'
      console.log(expectedSex)
      if (patientSex !== expectedSex) {
        const sexLabel = lsex === 'HOMBRE' ? 'masculino' : 'femenino'
        errors.push({
          field: `codigoCIEDiagnostico${fieldNum}`,
          message: `El diagnóstico "${dx.Name}" (${cieCode}) solo aplica para pacientes de sexo ${sexLabel}`,
          section: sectionDx
        })
      }
    }

    // --- Restricción de edad (LINF / LSUP) ---
    // Valores del catálogo: strings formato "020A" (3 dígitos + "A" de años), ej: "020A" = 20 años
    if (ageYears >= 0) {
      const linf = parsearLimiteEdad(catalogEntry.LINF)
      const lsup = parsearLimiteEdad(catalogEntry.LSUP)

      if (linf !== null && linf.anios > 0 && ageYears < linf.anios) {
        errors.push({
          field: `codigoCIEDiagnostico${fieldNum}`,
          message: `El diagnóstico "${dx.Name}" (${cieCode}) aplica a partir de ${linf.etiqueta}; el paciente tiene ${describirEdad(ageYears)}`,
          section: sectionDx
        })
      }

      if (lsup !== null && ageYears > lsup.anios) {
        errors.push({
          field: `codigoCIEDiagnostico${fieldNum}`,
          message: `El diagnóstico "${dx.Name}" (${cieCode}) aplica hasta ${lsup.etiqueta}; el paciente tiene ${describirEdad(ageYears)}`,
          section: sectionDx
        })
      }
    }

    // --- Confirmación diagnóstica ---
    // Crónico (DM2, HTA, Dislipidemias): primera vez, >= 20 años → debe estar confirmado
    if (
      catalogEntry.DIA_CRONICOS === '1' &&
      relacionTemporal === 'PrimeraVez' &&
      ageYears >= 20 &&
      dx.Confirmed !== true
    ) {
      errors.push({
        field: `confirmacionDiagnostica${fieldNum}`,
        message: `El diagnóstico "${dx.Name}" (${cieCode}) es una enfermedad crónica de primera vez en mayor de 20 años y debe estar confirmado`,
        section: sectionDx
      })
    }

    // Cáncer infantil: < 18 años → debe estar confirmado
    if (catalogEntry.DIA_CAINFANTIL === '1' && ageYears >= 0 && ageYears < 18 && dx.Confirmed !== true) {
      errors.push({
        field: `confirmacionDiagnostica${fieldNum}`,
        message: `El diagnóstico "${dx.Name}" (${cieCode}) aplica detección de cáncer infantil y debe estar confirmado`,
        section: sectionDx
      })
    }
  }

  if (errors.length > 0) {
    throw new BadRequest('Información clínica incompleta o inválida (NOM-024)', { errors })
  }

  return context
}
