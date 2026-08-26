import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

import type { HookContext } from '../../declarations'
import {
  assignedByTutor,
  normalizeTutorIds,
  unionAssignedPatients,
  withTutorAssignment
} from './team-tutors'

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
  // Administrar el equipo sigue siendo exclusivo del médico, pero la enfermera
  // tiene que poder ver sus invitaciones y responderlas: es la contraparte del
  // vínculo, y sin esto no habría forma de aceptar.
  if (path === 'medical-team') {
    const isInviteResponse =
      method === 'patch' && (context.data as any)?.inviteResponse !== undefined
    if (method === 'get' || isInviteResponse) return next()
    throw new Forbidden('La administración de equipos es exclusiva del médico tutor')
  }
  // El alta de paciente entra por `records.create` sin `patientId`; se resuelve
  // más abajo, cuando ya se conocen los tutores.
  const isPatientRegistration =
    path === 'records' && method === 'create' && !(context.data as any)?.patientId
  if (WRITE_METHODS.has(method)) {
    if (
      method === 'patch' &&
      ((context.data as any)?.patientId !== undefined || (context.data as any)?.recordId !== undefined)
    ) {
      throw new Forbidden('No se puede reasignar un recurso clínico')
    }
    if (path === 'groups') {
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
  }
  // `tutorId` singular es la forma vieja del vínculo; normalizeTutorIds cubre
  // las dos y deja las cuentas antiguas funcionando sin migrar.
  const tutorIds = normalizeTutorIds(user)
  if (!tutorIds.length) throw new Forbidden('La cuenta no tiene un médico tutor asignado')

  const tutors = (
    await Promise.all(
      tutorIds.map((tutorId) =>
        context.app
          .service('users')
          .get(tutorId, { provider: undefined })
          .catch(() => null)
      )
    )
  ).filter((candidate: any) => candidate && (candidate.role ?? 'medico') === 'medico') as any[]
  if (!tutors.length) throw new Forbidden('El médico tutor asignado no es válido')

  // LECTURA: unión de lo que le asignó cada médico, y de cada uno solo lo que
  // ese médico realmente tiene. La intersección evita que una asignación vieja
  // le deje abierto un paciente que el médico ya no lleva.
  const assignedPatientIds = unionAssignedPatients(
    tutors.map((tutor) => {
      const owned = new Set((tutor.patientsList ?? []).map((patientId: unknown) => String(patientId)))
      return {
        tutorId: String(tutor._id),
        patientIds: assignedByTutor(user, tutor._id).filter((patientId) => owned.has(patientId))
      }
    })
  )
  const tutorClues = [...new Set(tutors.flatMap((tutor) => tutor.clues ?? []))]

  // ESCRITURA: no puede ser unión. El registro tiene que quedar a nombre de UN
  // médico, así que la petición trae `tutorId`. Con un solo tutor se usa ese y
  // las cuentas de siempre no cambian; con dos o más hay que elegir.
  const requestedTutorId = String(
    (context.data as any)?.tutorId ?? (params.query as any)?.tutorId ?? ''
  )
  const resolveTargetTutor = () => {
    if (requestedTutorId) {
      const found = tutors.find((tutor) => String(tutor._id) === requestedTutorId)
      if (!found) throw new Forbidden('El médico indicado no es tu tutor')
      return found
    }
    if (tutors.length === 1) return tutors[0]
    // El front pinta un selector de médico con `medical-team` get('tutors').
    throw new BadRequest('Indica para qué médico es el registro (falta tutorId)')
  }
  // `tutorId` es de enrutamiento, no del recurso: no debe llegar al documento
  // ni a la query, donde `validateQuery` lo rechazaría por no estar en el
  // esquema del servicio.
  if ((context.data as any)?.tutorId !== undefined) delete (context.data as any).tutorId
  if ((params.query as any)?.tutorId !== undefined) delete (params.query as any).tutorId

  // Deja al paciente recién dado de alta dentro de la rebanada de ESE médico,
  // si no el filtro le cerraría el paciente que acaba de registrar.
  const adoptPatient = async (createdId: string, tutorId: string) => {
    const usersService = context.app.service('users')
    const fresh: any = await usersService.get(String(user._id), { provider: undefined })
    const teamAssignments = withTutorAssignment(fresh, tutorId, [
      ...assignedByTutor(fresh, tutorId),
      String(createdId)
    ])
    await usersService.patch(
      String(user._id),
      { teamAssignments, patientsList: unionAssignedPatients(teamAssignments) } as any,
      { provider: undefined }
    )
  }

  if (isPatientRegistration) {
    // El alta salta el filtro por paciente asignado: el paciente no existe aún.
    const target = resolveTargetTutor()
    params.user = target
    await next()
    const createdId =
      (context.result as any)?.patientId ??
      (context.result as any)?._id ??
      (context.result as any)?.data?._id
    if (createdId) await adoptPatient(String(createdId), String(target._id))
    return
  }

  // Conserva al actor y usa solo CLUES de sus tutores + asignaciones explícitas.
  params.user = { ...user, clues: tutorClues, patientsList: assignedPatientIds }
  if (path === 'agenda') {
    const appointmentPatientIds: string[] = ((context.data as any)?.appointments ?? []).map(
      (appointment: any) => String(appointment.patientId)
    )
    if (
      WRITE_METHODS.has(method) &&
      appointmentPatientIds.some((patientId) => !assignedPatientIds.includes(patientId))
    ) {
      throw new Forbidden('La cita pertenece a un paciente no asignado')
    }
    // En una cita el médico destino no hace falta preguntarlo: el paciente ya
    // pertenece a la lista de uno solo de sus tutores.
    const tutorsOfAppointment = [
      ...new Set(
        appointmentPatientIds
          .map(
            (patientId) =>
              tutors.find((tutor) => assignedByTutor(user, tutor._id).includes(patientId))?._id
          )
          .filter(Boolean)
          .map(String)
      )
    ]
    if (tutorsOfAppointment.length > 1) {
      throw new BadRequest('Las citas de médicos distintos se agendan por separado')
    }
    const agendaTutor = tutorsOfAppointment.length
      ? tutors.find((tutor) => String(tutor._id) === tutorsOfAppointment[0])
      : undefined
    params.user = agendaTutor ?? resolveTargetTutor()
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
    const target = resolveTargetTutor()
    params.user = target
    await next()
    const createdId = (context.result as any)?._id ?? (context.result as any)?.data?._id
    if (createdId) await adoptPatient(String(createdId), String(target._id))
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
