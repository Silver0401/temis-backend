import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

export const MAX_SIGNATURE_BYTES = 200 * 1024
const MAX_SIGNATURE_DATA_URL_LENGTH = Math.ceil(MAX_SIGNATURE_BYTES / 3) * 4 + 22

export const pngSignatureSchema = Type.String({
  minLength: 30,
  maxLength: MAX_SIGNATURE_DATA_URL_LENGTH,
  pattern: '^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$'
})

export const consentSignDataSchema = Type.Union(
  [
    Type.Object(
      {
        token: Type.String({ minLength: 48, maxLength: 48 }),
        mode: Type.Literal('canvas'),
        signatureImage: pngSignatureSchema,
        signerName: Type.String({ minLength: 2, maxLength: 160 })
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        token: Type.String({ minLength: 48, maxLength: 48 }),
        mode: Type.Literal('acceptance'),
        signerName: Type.String({ minLength: 2, maxLength: 160 })
      },
      { additionalProperties: false }
    )
  ],
  { $id: 'ConsentSignData' }
)
export type ConsentSignData = Static<typeof consentSignDataSchema>
export const consentSignDataValidator = getValidator(consentSignDataSchema, dataValidator)

export const consentSignGetResultSchema = Type.Object(
  {
    title: Type.String(),
    body: Type.String(),
    docVersion: Type.String(),
    docHash: Type.String(),
    doctorName: Type.String(),
    patientName: Type.Optional(Type.String())
  },
  { $id: 'ConsentSignGetResult', additionalProperties: false }
)
export type ConsentSignGetResult = Static<typeof consentSignGetResultSchema>

export const consentSignResultSchema = Type.Object(
  {
    status: Type.Literal('signed'),
    signedAt: Type.Number()
  },
  { $id: 'ConsentSignResult', additionalProperties: false }
)
export type ConsentSignResult = Static<typeof consentSignResultSchema>

export const consentSignQuerySchema = Type.Object({}, { additionalProperties: false })
export const consentSignQueryValidator = getValidator(consentSignQuerySchema, queryValidator)
