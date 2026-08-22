// Aislamiento de expedientes por CLUES (Clave Única de Establecimiento en Salud).
//
// Un médico solo puede ver un paciente/expediente si la intersección entre sus
// CLUES (`params.user.clues`) y las CLUES del paciente (`patient.clues`) no es vacía.
//
// Nota de compatibilidad: el campo `clues` del usuario era un string en datos
// legacy y ahora es un array. `normalizeClues` acepta ambas formas para no romper
// documentos aún no migrados en Mongo.
import { Forbidden, NotFound } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

// Convierte string | string[] | undefined en una lista limpia de CLUES.
export const normalizeClues = (value: unknown): string[] => {
  const normalize = (clues: string) => clues.trim().split(/\s+-\s+/, 1)[0].toUpperCase()

  if (Array.isArray(value)) {
    return value
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .map(normalize)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [normalize(value)]
  }
  return []
}

// true si `a` y `b` comparten al menos una CLUES.
export const cluesIntersect = (a: unknown, b: unknown): boolean => {
  const setA = new Set(normalizeClues(a))
  return normalizeClues(b).some((clues) => setA.has(clues))
}

// Filtro de Mongo reutilizable: `{ clues: { $in: userClues } }`.
// Con userClues vacío devuelve `{ $in: [] }`, que no hace match con nada (deny).
export const cluesQueryFilter = (userClues: unknown) => ({
  clues: { $in: normalizeClues(userClues) }
})

// Carga el paciente objetivo saltándose el scope (provider undefined) para poder
// comparar las CLUES nosotros mismos. Reusa el get existente de patients.
const loadPatient = async (context: HookContext, patientId: string) => {
  try {
    const res: any = await context.app
      .service('patients')
      .get(patientId, { provider: undefined, query: { skipRecords: true } } as any)
    return res?.data?.patientsList?.[0]
  } catch {
    return undefined
  }
}

// Hook before para servicios clínicos hijos (records/somas/labs/drugs/imgs/maps/orders)
// que se consultan por `patientId` (get) o `patientId~dxId`. Valida que el médico
// comparta CLUES con el paciente antes de resolver.
export const scopeByPatientId = async (context: HookContext) => {
  const { params, method, id } = context

  // Llamadas internas (provider undefined) son de confianza: no se scopan.
  if (!params.provider) return context

  const userClues = normalizeClues(params.user?.clues)

  let patientId: string | undefined
  if (method === 'get' && id != null) {
    patientId = String(id).split('~')[0].trim()
  } else if (method === 'find') {
    const raw = (params.query as any)?.patientId
    if (typeof raw === 'string') patientId = raw.split('~')[0].trim()
  }

  // Sin paciente asociado no hay forma de acotar por CLUES: se deniega el acceso.
  if (!patientId) {
    throw new Forbidden('Consulta no permitida sin paciente asociado')
  }

  const patient = await loadPatient(context, patientId)
  if (!patient || !cluesIntersect(userClues, patient.clues)) {
    throw new NotFound('No se encontró el recurso solicitado')
  }

  return context
}

// Hook before patch/remove para servicios clínicos hijos. Aquí el `id` es el _id
// del propio recurso (no el patientId), así que se carga el recurso, se resuelve su
// `patientId` y se valida que el médico comparta CLUES con ese paciente.
export const scopeByResourceId = async (context: HookContext) => {
  const { params, id, service } = context

  if (!params.provider) return context

  // No se permiten patch/remove masivos (id null) desde el exterior.
  if (id == null) {
    throw new Forbidden('Operación no permitida sin identificar el recurso')
  }

  const userClues = normalizeClues(params.user?.clues)

  // find con provider undefined salta el scope-by-patientId de este mismo servicio.
  const res: any = await (service as any).find({ provider: undefined, query: { _id: id } })
  const resource = Array.isArray(res) ? res[0] : res?.data?.[0]

  const patientId = resource?.patientId ? String(resource.patientId) : undefined
  if (!resource || !patientId) {
    throw new NotFound('No se encontró el recurso solicitado')
  }

  const patient = await loadPatient(context, patientId)
  if (!patient || !cluesIntersect(userClues, patient.clues)) {
    throw new NotFound('No se encontró el recurso solicitado')
  }

  return context
}

// Hook before patch/remove para el servicio patients: valida que el médico comparta
// CLUES con el paciente objetivo (el `id` ES el _id del paciente).
export const scopePatientsWrite = async (context: HookContext) => {
  const { params, id } = context

  if (!params.provider) return context

  if (id == null) {
    throw new Forbidden('Operación no permitida sin identificar al paciente')
  }

  const userClues = normalizeClues(params.user?.clues)
  const patient = await loadPatient(context, String(id))
  if (!patient || !cluesIntersect(userClues, patient.clues)) {
    throw new NotFound('No se encontró el recurso solicitado')
  }

  return context
}

// Hook before find para el servicio patients: inyecta el filtro de CLUES en la query
// para que la búsqueda estándar solo devuelva pacientes del establecimiento del médico.
export const scopePatientsFind = async (context: HookContext) => {
  if (!context.params.provider) return context

  context.params.query = {
    ...(context.params.query ?? {}),
    ...cluesQueryFilter(context.params.user?.clues)
  }

  return context
}
