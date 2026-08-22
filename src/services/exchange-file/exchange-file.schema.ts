// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ExchangeFileService } from './exchange-file.class'

// Main data model schema
export const exchangeFileSchema = Type.Object(
  {
    id: Type.Number(),
    patientId: Type.String(),
    recordId: Type.String(),
    fileRow: Type.String()
  },
  { $id: 'ExchangeFile', additionalProperties: false }
)
export type ExchangeFile = Static<typeof exchangeFileSchema>
export const exchangeFileValidator = getValidator(exchangeFileSchema, dataValidator)
export const exchangeFileResolver = resolve<ExchangeFileQuery, HookContext<ExchangeFileService>>({})

export const exchangeFileExternalResolver = resolve<ExchangeFile, HookContext<ExchangeFileService>>({})

// Schema for creating new entries
export const exchangeFileDataSchema = Type.Pick(exchangeFileSchema, ['patientId', 'recordId'], {
  $id: 'ExchangeFileData'
})
export type ExchangeFileData = Static<typeof exchangeFileDataSchema>
export const exchangeFileDataValidator = getValidator(exchangeFileDataSchema, dataValidator)
export const exchangeFileDataResolver = resolve<ExchangeFileData, HookContext<ExchangeFileService>>({})

// Schema for updating existing entries
export const exchangeFilePatchSchema = Type.Partial(exchangeFileSchema, {
  $id: 'ExchangeFilePatch'
})
export type ExchangeFilePatch = Static<typeof exchangeFilePatchSchema>
export const exchangeFilePatchValidator = getValidator(exchangeFilePatchSchema, dataValidator)
export const exchangeFilePatchResolver = resolve<ExchangeFilePatch, HookContext<ExchangeFileService>>({})

// Schema for allowed query properties
export const exchangeFileQueryProperties = Type.Pick(exchangeFileSchema, [])
export const exchangeFileQuerySchema = Type.Intersect(
  [
    querySyntax(exchangeFileQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        synthesizeExchange: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type ExchangeFileQuery = Static<typeof exchangeFileQuerySchema>
export const exchangeFileQueryValidator = getValidator(exchangeFileQuerySchema, queryValidator)
export const exchangeFileQueryResolver = resolve<ExchangeFileQuery, HookContext<ExchangeFileService>>({})
