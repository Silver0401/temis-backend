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
    fileRow: Type.String(),
    // --- Generación por lote ---
    /** El archivo entero, un renglón por paciente separado por salto de línea. */
    fileContent: Type.Optional(Type.String()),
    /** Pacientes que sí produjeron renglón. */
    total: Type.Optional(Type.Number()),
    /**
     * Pacientes que quedaron fuera y por qué. Se devuelven en vez de fallar: que
     * un paciente sin consultas en el rango tumbe el archivo de los otros
     * cincuenta no ayuda a nadie.
     */
    omitted: Type.Optional(
      Type.Array(Type.Object({ patientId: Type.String(), reason: Type.String() }))
    )
  },
  { $id: 'ExchangeFile', additionalProperties: false }
)
export type ExchangeFile = Static<typeof exchangeFileSchema>
export const exchangeFileValidator = getValidator(exchangeFileSchema, dataValidator)
export const exchangeFileResolver = resolve<ExchangeFileQuery, HookContext<ExchangeFileService>>({})

export const exchangeFileExternalResolver = resolve<ExchangeFile, HookContext<ExchangeFileService>>({})

/**
 * Alta: una de dos formas.
 *
 *  - `{ patientId, recordId }` — un renglón concreto, como siempre.
 *  - `{ patientIds, from?, to? }` — el archivo completo para una lista de
 *    pacientes; de cada uno se toma su PRIMERA consulta dentro del rango.
 *
 * Van en un solo objeto con todo opcional porque el validador resuelve mal las
 * uniones discriminadas aquí; cuál de las dos formas llegó lo decide el
 * servicio, que rechaza lo que no encaje en ninguna.
 */
export const exchangeFileDataSchema = Type.Object(
  {
    patientId: Type.Optional(Type.String()),
    recordId: Type.Optional(Type.String()),
    patientIds: Type.Optional(Type.Array(Type.String())),
    from: Type.Optional(Type.String()),
    to: Type.Optional(Type.String())
  },
  { $id: 'ExchangeFileData', additionalProperties: false }
)
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
