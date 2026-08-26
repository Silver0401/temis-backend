import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator } from '../../validators'

// Enfermeria es el unico rol que un medico puede dar de alta desde su equipo.
// `medico` se crea por registro publico y `admin` solo por seed.
export const teamMemberRoleSchema = Type.Union([Type.Literal('enfermeria')])
export const teamAccessStatusSchema = Type.Union([
  Type.Literal('active'),
  Type.Literal('suspended'),
  Type.Literal('revoked')
])

export const medicalTeamMemberSchema = Type.Object(
  {
    _id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    role: teamMemberRoleSchema,
    // Plural: una enfermera atiende normalmente a uno o dos medicos.
    tutorIds: Type.Array(Type.String()),
    status: teamAccessStatusSchema,
    // Solo los pacientes que le asigno el medico que hace la consulta.
    assignedPatientIds: Type.Array(Type.String())
  },
  { $id: 'MedicalTeamMember', additionalProperties: false }
)
export type MedicalTeamMember = Static<typeof medicalTeamMemberSchema>

// Lo que ve la enfermera: quien la invito y desde cuando.
export const medicalTeamInviteSchema = Type.Object(
  {
    tutorId: Type.String(),
    tutorName: Type.String(),
    status: Type.Union([
      Type.Literal('pending'),
      Type.Literal('accepted'),
      Type.Literal('rejected')
    ]),
    createdAt: Type.String()
  },
  { $id: 'MedicalTeamInvite', additionalProperties: false }
)
export type MedicalTeamInvite = Static<typeof medicalTeamInviteSchema>

// Medicos a los que ya pertenece. Alimenta el selector de medico destino de
// los flujos de escritura.
export const medicalTeamTutorSchema = Type.Object(
  { _id: Type.String(), name: Type.String() },
  { $id: 'MedicalTeamTutor', additionalProperties: false }
)
export type MedicalTeamTutor = Static<typeof medicalTeamTutorSchema>

export const medicalTeamDataSchema = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    email: Type.String({ format: 'email', maxLength: 254 }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
    role: teamMemberRoleSchema,
    assignedPatientIds: Type.Optional(Type.Array(ObjectIdSchema())),
    // El medico ya vio el 409 TEAM_MEMBER_EXISTS y confirma que quiere mandarle
    // invitacion a esa cuenta en vez de crear una nueva.
    inviteExisting: Type.Optional(Type.Boolean())
  },
  { $id: 'MedicalTeamData', additionalProperties: false }
)
export type MedicalTeamData = Static<typeof medicalTeamDataSchema>
export const medicalTeamDataValidator = getValidator(medicalTeamDataSchema, dataValidator)

export const medicalTeamPatchSchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 2, maxLength: 120 })),
    email: Type.Optional(Type.String({ format: 'email', maxLength: 254 })),
    password: Type.Optional(Type.String({ minLength: 8, maxLength: 128 })),
    role: Type.Optional(teamMemberRoleSchema),
    status: Type.Optional(teamAccessStatusSchema),
    assignedPatientIds: Type.Optional(Type.Array(ObjectIdSchema())),
    // Respuesta de la enfermera a una invitacion. Es el unico campo que ella
    // puede mandar a este servicio; el resto es exclusivo del medico tutor.
    inviteResponse: Type.Optional(
      Type.Union([Type.Literal('accepted'), Type.Literal('rejected')])
    )
  },
  { $id: 'MedicalTeamPatch', additionalProperties: false }
)
export type MedicalTeamPatch = Static<typeof medicalTeamPatchSchema>
export const medicalTeamPatchValidator = getValidator(medicalTeamPatchSchema, dataValidator)
