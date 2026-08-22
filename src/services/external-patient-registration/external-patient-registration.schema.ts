import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from '../../validators'

export const externalPatientRegistrationDataSchema = Type.Object(
  {
    doctorId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
    names: Type.String({ minLength: 2, maxLength: 50 }),
    middleName: Type.String({ minLength: 2, maxLength: 50 }),
    lastName: Type.String({ minLength: 2, maxLength: 50 }),
    sex: Type.Union([Type.Literal('Masculino'), Type.Literal('Femenino'), Type.Literal('Intersexual')]),
    genre: Type.Union([
      Type.Literal('Masculino'),
      Type.Literal('Femenino'),
      Type.Literal('Transgénero'),
      Type.Literal('Transexual'),
      Type.Literal('Travesti'),
      Type.Literal('Intersexual'),
      Type.Literal('Otro'),
      Type.Literal('No Especificado')
    ]),
    birthDate: Type.String({ pattern: '^\\d{2}/\\d{2}/\\d{4}$' }),
    birthCountry: Type.String({ minLength: 2, maxLength: 100 }),
    birthState: Type.Optional(Type.String({ minLength: 2, maxLength: 100 })),
    domicile: Type.Optional(Type.String({ maxLength: 300 })),
    curp: Type.String({ minLength: 18, maxLength: 18 }),
    derechohabiencia: Type.String({ minLength: 2, maxLength: 160 }),
    // GIIS-B015-04-11 campos 18-21
    seAutodenominaAfromexicano: Type.Optional(Type.Number()),
    seConsideraIndigena: Type.Optional(Type.Number()),
    migrante: Type.Optional(Type.Number()),
    paisProcedencia: Type.Optional(Type.Number())
  },
  { $id: 'ExternalPatientRegistrationData', additionalProperties: false }
)

export type ExternalPatientRegistrationData = Static<typeof externalPatientRegistrationDataSchema>
export const externalPatientRegistrationDataValidator = getValidator(
  externalPatientRegistrationDataSchema,
  dataValidator
)

export const externalPatientRegistrationResultSchema = Type.Object(
  { status: Type.Literal('registered') },
  { $id: 'ExternalPatientRegistrationResult', additionalProperties: false }
)
export type ExternalPatientRegistrationResult = Static<typeof externalPatientRegistrationResultSchema>
