import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from './validators'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    presence: Type.Optional(
      Type.Record(
        Type.String(),
        Type.Object({
          userId: Type.String(),
          phone: Type.Boolean(),
          computer: Type.Boolean()
        })
      )
    )
  })
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
