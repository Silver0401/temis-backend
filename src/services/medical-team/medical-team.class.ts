import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { MedicalTeamData, MedicalTeamMember, MedicalTeamPatch } from './medical-team.schema'

export interface MedicalTeamParams extends Params {}
export interface MedicalTeamServiceOptions {
  app: Application
}

export class MedicalTeamService {
  constructor(public options: MedicalTeamServiceOptions) {}

  private requireDoctor(params?: MedicalTeamParams) {
    const user = params?.user
    if (!user || (user.role ?? 'medico') !== 'medico') {
      throw new Forbidden('Solo un médico puede administrar su equipo')
    }
    return user
  }

  private async ownMember(id: string, params?: MedicalTeamParams) {
    const doctor = this.requireDoctor(params)
    const member: any = await this.options.app.service('users').get(id, { provider: undefined })
    if (!member || String(member.tutorId) !== String(doctor._id)) {
      throw new NotFound('No se encontró el integrante solicitado')
    }
    return { doctor, member }
  }

  private present(member: any): MedicalTeamMember {
    return {
      _id: String(member._id),
      name: member.name,
      email: member.email,
      role: member.role,
      tutorId: String(member.tutorId),
      status: member.teamAccessStatus ?? 'active',
      assignedPatientIds: (member.patientsList ?? []).map(String)
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

  async get(_id: string, params?: MedicalTeamParams): Promise<MedicalTeamMember[]> {
    const doctor = this.requireDoctor(params)
    const result: any = await this.options.app.service('users').find({
      provider: undefined,
      paginate: false,
      query: { tutorId: doctor._id }
    } as any)
    const members = Array.isArray(result) ? result : result.data
    return members
      .filter((member: any) => member.teamAccessStatus !== 'revoked')
      .map((member: any) => this.present(member))
  }

  async create(data: MedicalTeamData, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
    const doctor = this.requireDoctor(params)
    const assignedPatientIds = this.validateAssignments(doctor, data.assignedPatientIds)
    try {
      const member: any = await this.options.app.service('users').create(
        {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
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
        ? await this.options.app
            .service('users')
            .patch(member._id, { patientsList: assignedPatientIds } as any, { provider: undefined })
        : member
      return this.present(assigned)
    } catch (error: any) {
      if (error?.code === 11000) throw new BadRequest('El correo ya está registrado')
      throw error
    }
  }

  async patch(id: string, data: MedicalTeamPatch, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
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
      ...(data.role !== undefined ? { role: data.role, professionType: 'ENFERMERÍA' } : {}),
      ...(assignedPatientIds !== undefined ? { patientsList: assignedPatientIds } : {})
    }
    try {
      const member = await this.options.app.service('users').patch(id, patch as any, {
        provider: undefined,
        internalSubuserRole: data.role
      })
      return this.present(member)
    } catch (error: any) {
      if (error?.code === 11000) throw new BadRequest('El correo ya está registrado')
      throw error
    }
  }

  async remove(id: string, params?: MedicalTeamParams): Promise<MedicalTeamMember> {
    const { member } = await this.ownMember(id, params)
    const revoked = await this.options.app
      .service('users')
      .patch(id, { teamAccessStatus: 'revoked', patientsList: [] } as any, { provider: undefined })
    return this.present(revoked ?? member)
  }
}

export const getOptions = (app: Application): MedicalTeamServiceOptions => ({ app })
