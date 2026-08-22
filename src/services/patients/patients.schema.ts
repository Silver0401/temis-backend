// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PatientsService } from './patients.class'
import { normalizeClues } from '../../hooks/generic/scope-by-clues'

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
  colonia: Type.Optional(Type.String())
})

// Derechohabiencia is multi-value: each selected afiliación carries its GIIS
// catalog key (catalogKey 0 = not from the catalog, e.g. AI-extracted).
const AfiliacionSchema = Type.Object({
  catalogKey: Type.Number(),
  descripcion: Type.String()
})

// Main data model schema
export const patientsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    LUID: Type.String(),
    // CLUES de los establecimientos que pueden ver este expediente. Se asigna
    // al crear con las CLUES del médico creador (ver patientsDataResolver).
    clues: Type.Array(Type.String()),
    personalInfo: Type.Object({
      names: Type.String(),
      middleName: Type.String(),
      lastName: Type.String(),
      sex: Type.String(),
      birthDate: Type.String(),
      birthPlace: Type.Optional(Type.String()),
      domicile: Type.Optional(Type.String()),
      curp: Type.String(),
      genre: Type.String(),
      derechohabiencia: Type.Array(AfiliacionSchema),
      // GIIS-B015-04-11 campos 18-21: identificación étnica, migración y país de procedencia.
      seAutodenominaAfromexicano: Type.Optional(Type.Number()),
      seConsideraIndigena: Type.Optional(Type.Number()),
      migrante: Type.Optional(Type.Number()),
      paisProcedencia: Type.Optional(Type.Number())
    }),
    localizacion: Type.Optional(
      Type.Object({
        nacimiento: Type.Optional(LocalizacionItemSchema),
        domicilio: Type.Optional(LocalizacionItemSchema)
      })
    )
  },
  { $id: 'Patients', additionalProperties: false }
)
export type Patients = Static<typeof patientsSchema>
export const patientsValidator = getValidator(patientsSchema, dataValidator)
export const patientsResolver = resolve<Patients, HookContext<PatientsService>>({})

export const patientsExternalResolver = resolve<Patients, HookContext<PatientsService>>({})

// Schema for creating new entries
export const patientsDataSchema = Type.Pick(patientsSchema, ['personalInfo', 'LUID', 'localizacion'], {
  $id: 'PatientsData'
})
export type PatientsData = Static<typeof patientsDataSchema>
export const patientsDataValidator = getValidator(patientsDataSchema, dataValidator)
export const patientsDataResolver = resolve<Patients, HookContext<PatientsService>>({
  // Al crear un paciente hereda las CLUES del médico creador para el aislamiento.
  clues: async (_value, _data, context) => normalizeClues(context.params.user?.clues)
})

// Schema for updating existing entries
export const patientsPatchSchema = Type.Partial(patientsSchema, {
  $id: 'PatientsPatch',
  additionalProperties: false
})
export type PatientsPatch = Static<typeof patientsPatchSchema>
export const patientsPatchValidator = getValidator(patientsPatchSchema, dataValidator)
export const patientsPatchResolver = resolve<Patients, HookContext<PatientsService>>({})

// Schema for allowed query properties
export const patientsQueryProperties = Type.Pick(patientsSchema, [
  '_id',
  'LUID',
  'clues',
  'personalInfo',
  'localizacion'
])
export const patientsQuerySchema = Type.Intersect(
  [
    querySyntax(patientsQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        sectionToUpdate: Type.Optional(Type.String()),
        fileType: Type.Optional(Type.String()),
        skipRecords: Type.Optional(Type.Boolean()),
        // Lista de pacientes de un grupo (la fija populate_patients al vuelo).
        group_patients: Type.Optional(Type.Any()),
        // Filtro de aislamiento inyectado por scopePatientsFind / la clase.
        clues: Type.Optional(Type.Any())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type PatientsQuery = Static<typeof patientsQuerySchema>
export const patientsQueryValidator = getValidator(patientsQuerySchema, queryValidator)
export const patientsQueryResolver = resolve<PatientsQuery, HookContext<PatientsService>>({})
