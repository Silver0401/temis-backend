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
    tutorId: Type.String(),
    status: teamAccessStatusSchema,
    assignedPatientIds: Type.Array(Type.String())
  },
  { $id: 'MedicalTeamMember', additionalProperties: false }
)
export type MedicalTeamMember = Static<typeof medicalTeamMemberSchema>

export const medicalTeamDataSchema = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    email: Type.String({ format: 'email', maxLength: 254 }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
    role: teamMemberRoleSchema,
    assignedPatientIds: Type.Optional(Type.Array(ObjectIdSchema()))
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
    assignedPatientIds: Type.Optional(Type.Array(ObjectIdSchema()))
  },
  { $id: 'MedicalTeamPatch', additionalProperties: false }
)
export type MedicalTeamPatch = Static<typeof medicalTeamPatchSchema>
export const medicalTeamPatchValidator = getValidator(medicalTeamPatchSchema, dataValidator)
