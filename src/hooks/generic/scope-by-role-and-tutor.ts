import { Forbidden, NotFound } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

import type { HookContext } from '../../declarations'

// Enfermeria es el unico rol de equipo que existe (ver users.schema.ts).
const TEAM_ROLES = new Set(['enfermeria'])
const CLINICAL_PATHS = new Set(['patients', 'records', 'somas', 'labs', 'drugs', 'imgs', 'maps', 'orders'])
const CHILD_PATHS = new Set(['records', 'somas', 'labs', 'drugs', 'imgs', 'maps', 'orders'])
const RESTRICTED_TEAM_PATHS = new Set([
  'consents',
  'consent-sign',
  'exchange-file',
  'record-share',
  'record-redeem'
])
const WRITE_METHODS = new Set(['create', 'update', 'patch', 'remove'])

const resultItems = (result: any): any[] => {
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data?.patientsList)) return result.data.patientsList
  if (Array.isArray(result?.data)) return result.data
  return []
}

const filterPatientResult = (result: any, allowedIds: Set<string>) => {
  const allowed = (item: any) => allowedIds.has(String(item?._id))
  if (Array.isArray(result)) return result.filter(allowed)
  if (Array.isArray(result?.data?.patientsList)) {
    return { ...result, data: { ...result.data, patientsList: result.data.patientsList.filter(allowed) } }
  }
  if (Array.isArray(result?.data)) return { ...result, data: result.data.filter(allowed) }
  return result
}

export const scopeByRoleAndTutor = async (context: HookContext, next: () => Promise<void>) => {
  const { params, path, method, id } = context
  const user = params.user

  if (!params.provider || !user) return next()
  if (user.role === 'admin') {
    if (CLINICAL_PATHS.has(path)) {
      throw new Forbidden('La administración de plataforma no abre expedientes clínicos')
    }
    return next()
  }
  if (!TEAM_ROLES.has(user.role ?? 'medico')) return next()
  if ((user.teamAccessStatus ?? 'active') !== 'active') {
    throw new Forbidden('El acceso al equipo está suspendido o revocado')
  }
  if (path === 'logs') return next()
  if (RESTRICTED_TEAM_PATHS.has(path)) {
    throw new Forbidden('Esta operación es exclusiva del médico tutor')
  }
  if (WRITE_METHODS.has(method)) {
    if (
      method === 'patch' &&
      ((context.data as any)?.patientId !== undefined || (context.data as any)?.recordId !== undefined)
    ) {
      throw new Forbidden('No se puede reasignar un recurso clínico')
    }
    if (path === 'medical-team' || path === 'groups') {
      throw new Forbidden('La administración de grupos y equipos es exclusiva del médico tutor')
    }
    if (method === 'remove') {
      throw new Forbidden('Enfermería no puede eliminar información clínica')
    }
    // Enfermería levanta la ficha de identidad del paciente y captura
    // somatometría. La nota de evolución sigue siendo exclusiva del médico.
    //
    // El alta de paciente entra por `records.create` sin `patientId`: el hook
    // persist-new-patient crea el paciente y cuelga de él el registro inicial.
    // Un `records.create` CON `patientId` ya es una nota de evolución.
    const isPatientRegistration =
      path === 'records' && method === 'create' && !(context.data as any)?.patientId
    const nurseWritable =
      path === 'agenda' ||
      path === 'somas' ||
      // Extracción de CURP e INE del alta de paciente: son `uploads.create`.
      (path === 'uploads' && method === 'create') ||
      (path === 'patients' && method === 'create') ||
      isPatientRegistration
    if (!nurseWritable) {
      throw new Forbidden('Enfermería solo puede registrar pacientes y somatometrías')
    }
    // El alta salta el filtro por paciente asignado: el paciente todavía no existe.
    if (isPatientRegistration) return next()
  }
  if (!user.tutorId) throw new Forbidden('La cuenta no tiene un médico tutor asignado')

  const tutor: any = await context.app.service('users').get(user.tutorId, { provider: undefined })
  if (!tutor || (tutor.role ?? 'medico') !== 'medico') {
    throw new Forbidden('El médico tutor asignado no es válido')
  }

  const tutorPatientIds = new Set<string>(
    (tutor.patientsList ?? []).map((patientId: unknown) => String(patientId))
  )
  const assignedPatientIds = (user.patientsList ?? [])
    .map((patientId: unknown) => String(patientId))
    .filter((patientId: string) => tutorPatientIds.has(patientId))

  // Conserva al actor y usa solo CLUES del tutor + asignaciones explícitas del integrante.
  params.user = { ...user, clues: tutor.clues, patientsList: assignedPatientIds }
  if (path === 'agenda') {
    if (
      WRITE_METHODS.has(method) &&
      (context.data as any)?.appointments?.some(
        (appointment: any) => !assignedPatientIds.includes(String(appointment.patientId))
      )
    ) {
      throw new Forbidden('La cita pertenece a un paciente no asignado')
    }
    params.user = tutor
    await next()
    const agendaIds = new Set(assignedPatientIds)
    const filterAgenda = (agenda: any) => ({
      ...agenda,
      appointments: (agenda.appointments ?? []).filter((appointment: any) =>
        agendaIds.has(String(appointment.patientId))
      )
    })
    context.result = Array.isArray(context.result)
      ? context.result.map(filterAgenda)
      : context.result?.data
        ? { ...context.result, data: context.result.data.map(filterAgenda) }
        : context.result
    return
  }
  if (!CLINICAL_PATHS.has(path)) return next()

  const allowedIds = new Set<string>(assignedPatientIds)
  let patientId: string | undefined

  if (path === 'patients' && id != null && ObjectId.isValid(String(id))) {
    patientId = String(id)
  } else if (path === 'patients' && method === 'create') {
    // El alta pertenece al tutor; updateUserPatients actualizará su patientsList.
    // Después de crearlo se adopta también en la lista de la enfermera, si no
    // el filtro `user.patientsList ∩ tutor.patientsList` le cerraría el paciente
    // que acaba de registrar y no podría capturarle la somatometría.
    params.user = tutor
    await next()
    const createdId = (context.result as any)?._id ?? (context.result as any)?.data?._id
    if (createdId) {
      await context.app.service('users').patch(
        user._id,
        { patientsList: [...assignedPatientIds, String(createdId)] } as any,
        { provider: undefined }
      )
    }
    return
  } else if (CHILD_PATHS.has(path)) {
    if (method === 'get' && id != null) {
      patientId = String(id).split('~')[0]
    }
    if (method === 'find') patientId = String((params.query as any)?.patientId ?? patientId ?? '')
    if (method === 'create') patientId = String((context.data as any)?.patientId ?? '')
    if ((method === 'patch' || method === 'remove') && id != null) {
      const found: any = await (context.service as any).find({
        provider: undefined,
        paginate: false,
        query: { _id: id }
      })
      patientId = String(resultItems(found)[0]?.patientId ?? '')
    }
  }

  if (patientId && !allowedIds.has(patientId)) throw new NotFound('No se encontró el recurso solicitado')
  if (CHILD_PATHS.has(path) && !patientId) {
    throw new Forbidden('Consulta no permitida sin paciente asociado')
  }

  await next()
  if (path === 'patients') context.result = filterPatientResult(context.result, allowedIds)
}
