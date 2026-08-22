import { Type, getValidator } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

export const consentStatusSchema = Type.Union([Type.Literal('pending'), Type.Literal('signed')])

export const consentSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    token: Type.String({ minLength: 48, maxLength: 48 }),
    creatorId: ObjectIdSchema(),
    templateId: Type.String({ minLength: 1, maxLength: 80 }),
    docVersion: Type.String({ minLength: 1, maxLength: 40 }),
    docHash: Type.String({ pattern: '^[a-f0-9]{64}$' }),
    patientId: Type.Optional(ObjectIdSchema()),
    patientName: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
    status: consentStatusSchema,
    createdAt: Type.Number(),
    expiresAt: Type.Number(),
    signatureMode: Type.Optional(Type.Union([Type.Literal('canvas'), Type.Literal('acceptance')])),
    signatureImage: Type.Optional(
      Type.String({
        maxLength: 273090,
        pattern: '^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$'
      })
    ),
    signerName: Type.Optional(Type.String({ minLength: 2, maxLength: 160 })),
    signedAt: Type.Optional(Type.Number()),
    signerIp: Type.Optional(Type.String({ maxLength: 200 })),
    userAgent: Type.Optional(Type.String({ maxLength: 1000 }))
  },
  { $id: 'Consent', additionalProperties: false }
)
export type Consent = Static<typeof consentSchema>

export const consentDataSchema = Type.Object(
  {
    templateId: Type.String({ minLength: 1, maxLength: 80 }),
    patientId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    patientName: Type.Optional(Type.String({ minLength: 1, maxLength: 200 }))
  },
  { $id: 'ConsentData', additionalProperties: false }
)
export type ConsentData = Static<typeof consentDataSchema>
export const consentDataValidator = getValidator(consentDataSchema, dataValidator)

export const consentPatchSchema = Type.Partial(consentSchema, {
  $id: 'ConsentPatch',
  additionalProperties: false
})
export type ConsentPatch = Static<typeof consentPatchSchema>

export const consentQuerySchema = Type.Object(
  {
    patientId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    status: Type.Optional(consentStatusSchema)
  },
  { $id: 'ConsentQuery', additionalProperties: false }
)
export type ConsentQuery = Static<typeof consentQuerySchema>
export const consentQueryValidator = getValidator(consentQuerySchema, queryValidator)
