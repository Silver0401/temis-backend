// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'
import { clinicalHistoryBaseFormat, evoNoteBaseFormat } from '../../json/Constants'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { UserService } from './users.class'

const LocalizacionEntrySchema = Type.Object({
  id: Type.String(),
  nombre: Type.String(),
  catalogKey: Type.Optional(Type.Number())
})

const LocalizacionItemSchema = Type.Object({
  pais: Type.Optional(LocalizacionEntrySchema),
  estado: Type.Optional(LocalizacionEntrySchema),
  municipio: Type.Optional(LocalizacionEntrySchema),
  localidad: Type.Optional(LocalizacionEntrySchema),
  calle: Type.Optional(Type.String()),
  colonia: Type.Optional(Type.String()),
  domicilioTexto: Type.Optional(Type.String())
})

const NufiDataSchema = Type.Object({
  sex: Type.String(),
  birthDate: Type.String(),
  birthPlace: Type.String(),
  domicile: Type.String(),
  curp: Type.String(),
  vigencia: Type.String(),
  model: Type.String(),
  mrz: Type.String()
})

// Access role (version of access). Drives which dashboard the account sees.
// Defaults to 'medico' for legacy users without the field (see userDataResolver).
export const userRoleSchema = Type.Union([
  Type.Literal('medico'),
  // Unico rol de equipo: se crea desde el servicio `medical-team` bajo la
  // tutela de un medico.
  Type.Literal('enfermeria'),
  // Rol de supervision global. No se crea por registro ni desde `medical-team`;
  // se siembra con src/Scripts/seed-admin.ts.
  Type.Literal('admin')
])
export type UserRole = Static<typeof userRoleSchema>

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    email: Type.String(),
    name: Type.String(),
    // CLUES del médico. Es una LISTA: un médico puede pertenecer a varios
    // establecimientos. Datos legacy pueden tener un string suelto (ver
    // normalizeClues en hooks/generic/scope-by-clues.ts).
    clues: Type.Array(Type.String()),
    role: Type.Optional(userRoleSchema),
    // Medico tutor del integrante de equipo; ausente en un medico.
    tutorId: Type.Optional(ObjectIdSchema()),
    teamAccessStatus: Type.Optional(
      Type.Union([Type.Literal('active'), Type.Literal('suspended'), Type.Literal('revoked')])
    ),
    password: Type.Optional(Type.String()),
    googleId: Type.Optional(Type.String()),
    groups: Type.Array(
      Type.Object({
        id: ObjectIdSchema(),
        name: Type.String()
      })
    ),
    medicalLicenses: Type.Array(
      Type.Object({
        id: Type.String(),
        institution: Type.Optional(Type.String()),
        profession: Type.Optional(Type.String()),
        registrationYear: Type.Optional(Type.String())
      })
    ),
    professionType: Type.String(),
    nombrePrestador: Type.Optional(Type.String()),
    primerApellidoPrestador: Type.Optional(Type.String()),
    segundoApellidoPrestador: Type.Optional(Type.String()),
    curpPrestador: Type.Optional(Type.String()),
    birthLocalizacion: Type.Optional(LocalizacionItemSchema),
    residenceLocalizacion: Type.Optional(LocalizacionItemSchema),
    patientsList: Type.Array(ObjectIdSchema()),
    formats: Type.Object({
      clinicalHistory: Type.String(),
      evoNote: Type.String()
    }),
    UID: Type.Object({
      type: Type.String(),
      frontImg: Type.String(),
      reverseImg: Type.String(),
      faceImg: Type.String(),
      validity: Type.Optional(Type.String()),
      model: Type.Optional(Type.String()),
      mrz: Type.Optional(Type.String())
    }),
    personalInfo: Type.Object({
      sex: Type.String(),
      birthDate: Type.String(),
      birthPlace: Type.String(),
      domicile: Type.String(),
      curp: Type.String()
    }),
    status: Type.Object({
      devices: Type.Array(Type.String()),
      recording: Type.Boolean()
    })
  },
  { $id: 'User', additionalProperties: false }
)
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext<UserService>>({})

export const userExternalResolver = resolve<User, HookContext<UserService>>({
  // The password should never be visible externally
  password: async () => undefined
})

const userRegistrationSchema = Type.Object(
  {
    nombre: Type.Optional(Type.String()),
    primerApellido: Type.Optional(Type.String()),
    segundoApellido: Type.Optional(Type.String()),
    curpPrestador: Type.Optional(Type.String()),
    nufiPreVerified: Type.Optional(Type.Boolean()),
    nufiData: Type.Optional(NufiDataSchema),
    birthLocalizacion: Type.Optional(LocalizacionItemSchema),
    residenceLocalizacion: Type.Optional(LocalizacionItemSchema)
  },
  { additionalProperties: false }
)

// Schema for creating new entries
export const userDataSchema = Type.Intersect(
  [
    Type.Pick(userSchema, [
      'email',
      'password',
      'name',
      'googleId',
      'medicalLicenses',
      'UID',
      'professionType',
      'clues'
    ]),
    userRegistrationSchema
  ],
  { $id: 'UserData', additionalProperties: false }
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' }),
  patientsList: () => [],
  formats: () => ({ clinicalHistory: clinicalHistoryBaseFormat, evoNote: evoNoteBaseFormat }),
  email: (email) => email?.toLowerCase(),
  groups: () => [],
  status: () => ({ devices: [], recording: false }),
  role: (_value, _data, context) => context.params.internalSubuserRole ?? 'medico',
  tutorId: (_value, _data, context) => context.params.internalTutorId,
  teamAccessStatus: (_value, _data, context) =>
    context.params.internalSubuserRole ? 'active' : undefined
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
// En un patch externo (con provider) se descartan los campos sensibles para evitar
// escalada de privilegios / auto-asignación (p. ej. PATCH /users/<propioId> {role:'admin'}).
// Solo procesos internos (provider undefined) o migraciones pueden tocarlos.
const stripIfExternal = async (value: unknown, _user: unknown, context: HookContext) =>
  context.params.provider ? undefined : (value as any)

const TEAM_ROLES = new Set(['enfermeria'])

// Un integrante de equipo nunca administra su propia lista de pacientes: se la
// asigna su tutor desde el servicio `medical-team`.
const ownPatientsListOrStrip = async (value: unknown, _user: unknown, context: HookContext) => {
  if (context.params.provider && TEAM_ROLES.has(context.params.user?.role ?? 'medico')) return undefined
  return !context.params.provider || String(context.id) === String(context.params.user?._id)
    ? (value as any)
    : undefined
}

export const userPatchResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' }),
  role: (value, _user, context) =>
    context.params.internalSubuserRole ?? (context.params.provider ? undefined : (value as any)),
  tutorId: stripIfExternal,
  teamAccessStatus: stripIfExternal,
  groups: stripIfExternal,
  clues: stripIfExternal,
  patientsList: ownPatientsListOrStrip
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, [
  '_id',
  'email',
  'name',
  'formats',
  'personalInfo',
  'clues',
  'professionType',
  'medicalLicenses',
  'nombrePrestador',
  'primerApellidoPrestador',
  'segundoApellidoPrestador',
  'curpPrestador',
  'birthLocalizacion',
  'residenceLocalizacion',
  'groups',
  'role',
  'tutorId',
  'teamAccessStatus'
])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext<UserService>>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  _id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  }
})
