/**
 * Construye el RoutingContext de una atención.
 *
 * Es la ÚNICA fuente de los gates deterministas del router. No llama a la IA:
 * edad, sexo biológico, tipo de personal y CLUES son datos duros, y las guías
 * los expresan con números exactos (10-59, >=60, mujer 35-64...). Mantenerlos
 * fuera del prompt reduce tokens y elimina una clase entera de alucinación.
 */
import type { HookContext } from '../../declarations'
import type { DiagnosticoCatalogo, RoutingContext, SexoBiologico } from './types'

/** Catálogo TIPO PERSONAL – SIS: trabajo social. Gate transversal de B019. */
export const TIPO_PERSONAL_TRABAJO_SOCIAL = 30

/** Calcula años cumplidos desde "dd/mm/aaaa" o ISO. null si no es parseable. */
export function calcularEdad(birthDate: string | undefined | null): number | null {
  if (!birthDate) return null

  let day: number, month: number, year: number
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
    ;[day, month, year] = birthDate.split('/').map(Number)
  } else if (/^\d{4}-\d{2}-\d{2}/.test(birthDate)) {
    const [y, m, d] = birthDate.split('T')[0].split('-').map(Number)
    year = y
    month = m
    day = d
  } else {
    return null
  }

  const birth = new Date(year, month - 1, day)
  if (Number.isNaN(birth.getTime())) return null

  const now = new Date()
  let edad = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) edad -= 1

  return edad >= 0 && edad <= 130 ? edad : null
}

/**
 * Mapea el sexo persistido al catálogo GIIS campo 17.
 * El paciente guarda el nombre completo: 'Masculino' | 'Femenino' | 'Intersexual'.
 */
export function mapSexoBiologico(sex: string | undefined | null): SexoBiologico | null {
  if (sex === 'Masculino') return 1
  if (sex === 'Femenino') return 2
  if (sex === 'Intersexual') return 3
  return null
}

/** Extrae la clave numérica del catálogo de tipo de personal del usuario. */
export function mapTipoPersonal(professionType: string | undefined | null): number | null {
  if (!professionType) return null
  const match = professionType.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Arma el contexto de ruteo. Se llama después de patientIdDataValidator, para
 * que la identificación ya esté validada.
 */
export function buildRoutingContext(context: HookContext): RoutingContext {
  const patient = (context.params as any).patientData
  const info = patient?.personalInfo ?? (context.data as any)?.patientIdentification
  const user = (context.params as any).user

  const cluesRaw = Array.isArray(user?.clues) ? user.clues[0] : user?.clues
  const clues = typeof cluesRaw === 'string' ? cluesRaw.split(' - ')[0] : null

  // El médico captura el diagnóstico junto con la nota, así que ya está aquí
  // cuando corre el router. GIIS admite hasta tres.
  const diagnosticos: DiagnosticoCatalogo[] = ((context.data as any)?.diagnosisCatalog ?? []).slice(0, 3)

  return {
    edad: calcularEdad(info?.birthDate),
    sexoBiologico: mapSexoBiologico(info?.sex),
    tipoPersonal: mapTipoPersonal(user?.professionType),
    clues,
    clinicalHistory: (context.data as any)?.ClinicalHistory ?? '',
    aiFlags: {},
    diagnosticos
  }
}

// --- Predicados reutilizables por las hojas ---------------------------------

/** El gate transversal de B019: casi ninguna detección aplica a trabajo social. */
export const noEsTrabajoSocial = (ctx: RoutingContext): boolean =>
  ctx.tipoPersonal !== TIPO_PERSONAL_TRABAJO_SOCIAL

/** Edad mínima cumplida. Falso si no hay fecha de nacimiento. */
export const edadMin = (ctx: RoutingContext, min: number): boolean => ctx.edad !== null && ctx.edad >= min

/** Rango de edad inclusivo. */
export const edadEntre = (ctx: RoutingContext, min: number, max: number): boolean =>
  ctx.edad !== null && ctx.edad >= min && ctx.edad <= max

/** Sexo biológico dentro de la lista dada. */
export const esSexo = (ctx: RoutingContext, ...valores: SexoBiologico[]): boolean =>
  ctx.sexoBiologico !== null && valores.includes(ctx.sexoBiologico)

/** Edad estrictamente menor. Falso si no hay fecha de nacimiento. */
export const edadMenor = (ctx: RoutingContext, max: number): boolean => ctx.edad !== null && ctx.edad < max

/**
 * ¿Alguno de los diagnósticos capturados cae en el rango CIE dado?
 * Los rangos se expresan por las tres primeras posiciones de la clave, que es
 * como el catálogo las agrupa: 'A00'..'A09' son infecciones intestinales,
 * 'J00'..'J22' infecciones respiratorias agudas.
 */
export const dxEnRango = (ctx: RoutingContext, desde: string, hasta: string): boolean =>
  ctx.diagnosticos.some((dx) => {
    const clave = (dx.CATALOG_KEY ?? '').slice(0, 3).toUpperCase()
    return clave.length === 3 && clave >= desde.toUpperCase() && clave <= hasta.toUpperCase()
  })

/** ¿Se capturó exactamente esta clave CIE de cuatro caracteres? */
export const tieneDx = (ctx: RoutingContext, ...claves: string[]): boolean =>
  ctx.diagnosticos.some((dx) => claves.includes((dx.CATALOG_KEY ?? '').toUpperCase()))
