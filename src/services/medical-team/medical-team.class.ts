import { BadRequest, Conflict, Forbidden, NotFound } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import {
  assignedByTutor,
  isTutorOf,
  normalizeAssignments,
  normalizeInvites,
  normalizeTutorIds,
  unionAssignedPatients,
  withTutorAssignment
} from '../../hooks/generic/team-tutors'
import type {
  MedicalTeamData,
  MedicalTeamInvite,
  MedicalTeamMember,
  MedicalTeamPatch,
  MedicalTeamTutor
} from './medical-team.schema'

export interface MedicalTeamParams extends Params {}
export interface MedicalTeamServiceOptions {
  app: Application
}

// `get` no tiene recurso propio: el id es una palabra clave. Enfermeria usa
// esta para consultar sus invitaciones pendientes.
export const INVITATIONS_ID = 'invitations'
export const TUTORS_ID = 'tutors'

export class MedicalTeamService {
  constructor(public options: MedicalTeamServiceOptions) {}

  private requireDoctor(params?: MedicalTeamParams) {
    const user = params?.user
    if (!user || (user.role ?? 'medico') !== 'medico') {
      throw new Forbidden('Solo un médico puede administrar su equipo')
    }
    return user
  }

  private users() {
    return this.options.app.service('users')
  }

  private async ownMember(id: string, params?: MedicalTeamParams) {
    const doctor = this.requireDoctor(params)
    const member: any = await this.users().get(id, { provider: undefined })
    // El vinculo es plural, y las cuentas viejas traen `tutorId` suelto:
    // normalizeTutorIds cubre las dos formas.
    if (!member || !isTutorOf(member, doctor._id)) {
      throw new NotFound('No se encontró el integrante solicitado')
    }
    return { doctor, member }
  }

  /** Solo la rebanada del medico que llama. Nunca los pacientes de otro tutor. */
  private present(member: any, doctorId: unknown): MedicalTeamMember {
    return {
      _id: String(member._id),
      name: member.name,
      email: member.email,
      role: member.role,
      tutorIds: normalizeTutorIds(member),
      status: member.teamAccessStatus ?? 'active',
      assignedPatientIds: assignedByTutor(member, doctorId)
    }
  }

  private validateAssignments(doctor: any, patientIds: unknown[] = []) {
    const owned = new Set((doctor.patientsList ?? []).map(String))
    const assigned = [...new Set(patientIds.map(String))]
    if (assigned.some((patientId) => !owned.has(patientId))) {
      throw new Forbidden('Solo puedes asignar pacientes de tu propia lista')
    }
    return assigned
  }

  /** Escribe la rebanada de un tutor y recalcula la union derivada. Todo
   *  escritor pasa por aqui: dos calculos independientes divergirian. */
  private async writeAssignment(memberId: string, member: any, doctorId: unknown, patientIds: string[]) {
    const teamAssignments = withTutorAssignment(member, doctorId, patientIds)
    return this.users().patch(
      memberId,
      {
        teamAssignments,
        patientsList: unionAssignedPatients(teamAssignments)
      } as any,
      { provider: undefined }
    )
  }

  private async findByEmail(email: string) {
    const result: any = await this.users().find({
      provider: undefined,
      paginate: false,
      query: { email: email.trim().toLowerCase() }
    } as any)
    return (Array.isArray(result) ? result : result.data)[0]
  }

  private async teamOf(doctorId: unknown) {
    // Dos consultas en vez de un `$or`: `tutorIds` es el campo actual y
    // `tutorId` el de las cuentas viejas, y querySyntax no expone `$or`.
    const query = async (criteria: Record<string, unknown>) => {
      const result: any = await this.users().find({
        provider: undefined,
        paginate: false,
        query: criteria
      } as any)
      return Array.isArray(result) ? result : result.data
    }
    // `{ tutorIds: <id> }` a secas NO pasa `validateQuery`: querySyntax deriva
    // el esquema del arreglo y rechaza el escalar suelto. Con `$in` sí pasa, y
    // en Mongo equivale a "el arreglo contiene ese id".
    const [plural, legacy] = await Promise.all([
      query({ tutorIds: { $in: [doctorId] } }),
      query({ tutorId: doctorId })
    ])
    const byId = new Map<string, any>()
    for (const member of [...plural, ...legacy]) byId.set(String(member._id), member)
    return [...byId.values()]
  }

  /** Invitaciones pendientes de la enfermera que consulta. */
  private async ownInvitations(params?: MedicalTeamParams): Promise<MedicalTeamInvite[]> {
    const user = params?.user
    if (!user) throw new Forbidden('Sesión no válida')
    const fresh: any = await this.users().get(String(user._id), { provider: undefined })
    const pending = normalizeInvites(fresh).filter((invite) => invite.status === 'pending')
    const doctors = await Promise.all(
      pending.map((invite) =>
        this.users()
          .get(invite.tutorId, { provider: undefined })
          .catch(() => null)
      )
    )
    return pending.map((invite, index) => ({
      tutorId: invite.tutorId,
      // Ella si puede ver quien la invita: es la contraparte del vinculo.
      tutorName: (doctors[index] as any)?.name ?? 'Médico',
      status: invite.status,
      createdAt: invite.createdAt
    }))
  }

  /** Los medicos a los que ella ya pertenece. El front los necesita para el
   *  selector: escribir exige un medico destino, no puede ser la union. */
  private async ownTutors(params?: MedicalTeamParams): Promise<MedicalTeamTutor[]> {
    const user = params?.user
    if (!user) throw new Forbidden('Sesión no válida')
    const fresh: any = await this.users().get(String(user._id), { provider: undefined })
    const tutors = await Promise.all(
      normalizeTutorIds(fresh).map((tutorId) =>
        this.users()
          .get(tutorId, { provider: undefined })
          .catch(() => null)
      )
    )
    return tutors
      .filter((tutor: any) => tutor && (tutor.role ?? 'medico') === 'medico')
      .map((tutor: any) => ({ _id: String(tutor._id), name: tutor.name }))
  }

  async get(
    id: string,
    params?: MedicalTeamParams
  ): Promise<MedicalTeamMember[] | MedicalTeamInvite[] | MedicalTeamTutor[]> {
    if (String(id) === INVITATIONS_ID) return this.ownInvitations(params)
    if (String(id) === TUTORS_ID) return this.ownTutors(params)
    const doctor = this.requireDoctor(params)
    const members = await this.teamOf(doctor._id)
    return members
      .filter((member: any) => member.teamAccessStatus !== 'revoked')
      .map((member: any) => this.present(member, doctor._id))
  }

  async create(data: MedicalTeamData, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
    const doctor = this.requireDoctor(params)
    const assignedPatientIds = this.validateAssignments(doctor, data.assignedPatientIds)
    const email = data.email.trim().toLowerCase()

    // El medico ya vio el 409 y confirmo que quiere invitar a esa cuenta.
    if (data.inviteExisting) return this.invite(email, doctor)

    try {
      const member: any = await this.users().create(
        {
          name: data.name.trim(),
          email,
          password: data.password,
          clues: doctor.clues,
          medicalLicenses: [],
          professionType: 'ENFERMERÍA',
          UID: { type: 'managed', frontImg: '', reverseImg: '', faceImg: '' }
        } as any,
        {
          provider: undefined,
          internalSubuserRole: data.role,
          internalTutorId: doctor._id
        }
      )
      const assigned = assignedPatientIds.length
        ? await this.writeAssignment(String(member._id), member, doctor._id, assignedPatientIds)
        : member
      return this.present(assigned, doctor._id)
    } catch (error: any) {
      if (error?.code === 11000) await this.rejectOrOfferInvite(email)
      throw error
    }
  }

  /** El correo ya existe. Si la cuenta es de enfermeria se ofrece invitarla;
   *  si es de un medico o un administrador se rechaza de plano, porque si no
   *  cualquiera podria anexarse una cuenta ajena a su equipo. */
  private async rejectOrOfferInvite(email: string): Promise<never> {
    const existing = await this.findByEmail(email)
    if (existing && (existing.role ?? 'medico') === 'enfermeria') {
      // El cuerpo no dice de quien es la cuenta ni que rol tiene: ya es un
      // oraculo de existencia de correos, no hay que sumarle uno de roles.
      throw new Conflict('Este perfil ya existe', { code: 'TEAM_MEMBER_EXISTS', email })
    }
    throw new BadRequest('El correo ya está registrado')
  }

  /** Deja la invitacion en `pending`. El tutor NO se agrega aqui: se agrega
   *  cuando ella acepta. */
  private async invite(email: string, doctor: any): Promise<MedicalTeamMember> {
    const member = await this.findByEmail(email)
    if (!member || (member.role ?? 'medico') !== 'enfermeria') {
      throw new BadRequest('El correo ya está registrado')
    }
    if (isTutorOf(member, doctor._id)) {
      throw new BadRequest('Esta persona ya forma parte de tu equipo')
    }
    const invites = normalizeInvites(member).filter((invite) => invite.tutorId !== String(doctor._id))
    invites.push({ tutorId: String(doctor._id), status: 'pending', createdAt: new Date().toISOString() })
    const updated: any = await this.users().patch(member._id, { teamInvites: invites } as any, {
      provider: undefined
    })
    return this.present(updated ?? member, doctor._id)
  }

  /** Enfermeria acepta o rechaza; `id` es el medico que invita. */
  private async respondToInvite(
    tutorId: string,
    response: 'accepted' | 'rejected',
    params?: MedicalTeamParams
  ): Promise<MedicalTeamMember> {
    const user = params?.user
    if (!user || (user.role ?? 'medico') !== 'enfermeria') {
      throw new Forbidden('Solo un integrante de equipo puede responder una invitación')
    }
    const member: any = await this.users().get(String(user._id), { provider: undefined })
    const invites = normalizeInvites(member)
    const invite = invites.find((item) => item.tutorId === String(tutorId) && item.status === 'pending')
    if (!invite) throw new NotFound('No se encontró la invitación')

    const patch: Record<string, unknown> = {
      teamInvites: invites.map((item) => (item === invite ? { ...item, status: response } : item))
    }
    if (response === 'accepted') {
      // Recien aqui nace el vinculo, con la rebanada de ese medico vacia.
      patch.tutorIds = [...new Set([...normalizeTutorIds(member), String(tutorId)])]
      patch.teamAssignments = withTutorAssignment(member, tutorId, [])
      patch.teamAccessStatus = member.teamAccessStatus ?? 'active'
    }
    const updated: any = await this.users().patch(member._id, patch as any, { provider: undefined })
    return this.present(updated ?? member, tutorId)
  }

  async patch(id: string, data: MedicalTeamPatch, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
    if (data.inviteResponse) return this.respondToInvite(id, data.inviteResponse, params)

    const { doctor, member } = await this.ownMember(id, params)
    if (member.teamAccessStatus === 'revoked') throw new Forbidden('El acceso ya fue revocado')
    const assignedPatientIds =
      data.assignedPatientIds === undefined
        ? undefined
        : this.validateAssignments(doctor, data.assignedPatientIds)
    const patch = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {}),
      ...(data.password !== undefined ? { password: data.password } : {}),
      ...(data.status !== undefined ? { teamAccessStatus: data.status } : {}),
      ...(data.role !== undefined ? { role: data.role, professionType: 'ENFERMERÍA' } : {})
    }
    try {
      let updated: any = Object.keys(patch).length
        ? await this.users().patch(id, patch as any, {
            provider: undefined,
            internalSubuserRole: data.role
          })
        : member
      if (assignedPatientIds !== undefined) {
        // Solo la rebanada de este medico; las de los demas quedan intactas.
        updated = await this.writeAssignment(id, updated, doctor._id, assignedPatientIds)
      }
      return this.present(updated, doctor._id)
    } catch (error: any) {
      if (error?.code === 11000) throw new BadRequest('El correo ya está registrado')
      throw error
    }
  }

  /** Sacarla del equipo de ESTE medico. La cuenta solo se revoca del todo si
   *  no le queda ningun otro tutor. */
  async remove(id: string, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
    const { doctor, member } = await this.ownMember(id, params)
    const remainingTutors = normalizeTutorIds(member).filter(
      (tutorId) => tutorId !== String(doctor._id)
    )
    const teamAssignments = normalizeAssignments(member).filter(
      (assignment) => assignment.tutorId !== String(doctor._id)
    )
    const updated: any = await this.users().patch(
      id,
      {
        tutorIds: remainingTutors,
        // La cuenta legacy conserva `tutorId`; hay que limpiarlo o el vinculo
        // reviviria al normalizar.
        tutorId: undefined,
        teamAssignments,
        patientsList: unionAssignedPatients(teamAssignments),
        ...(remainingTutors.length ? {} : { teamAccessStatus: 'revoked' })
      } as any,
      { provider: undefined }
    )
    return this.present(updated ?? member, doctor._id)
  }
}

export const getOptions = (app: Application): MedicalTeamServiceOptions => ({ app })
