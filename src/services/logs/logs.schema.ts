// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { LogsService } from './logs.class'

// Main data model schema
export const logsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    patientId: Type.Optional(ObjectIdSchema()),
    action: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    resourceType: Type.String(),
    resourceId: Type.Optional(Type.String()),
    status: Type.Union([Type.Literal('success'), Type.Literal('error')]),
    errorMessage: Type.Optional(Type.String()),
    ipAddress: Type.Optional(Type.String()),
    sessionRef: Type.Optional(Type.String()) // JWT jti or session token reference
  },
  { $id: 'Logs', additionalProperties: false }
)
export type Logs = Static<typeof logsSchema>
export const logsValidator = getValidator(logsSchema, dataValidator)
export const logsResolver = resolve<Logs, HookContext<LogsService>>({
  // Timestamp is always set server-side — clients cannot forge it
  timestamp: async () => new Date().toISOString()
})

export const logsExternalResolver = resolve<Logs, HookContext<LogsService>>({})

// Schema for creating new log entries (clients/hooks only send the payload — timestamp is injected by the resolver)
export const logsDataSchema = Type.Pick(
  logsSchema,
  ['patientId', 'action', 'timestamp', 'resourceType', 'resourceId', 'status', 'errorMessage', 'sessionRef'],
  { $id: 'LogsData' }
)
export type LogsData = Static<typeof logsDataSchema>
export const logsDataValidator = getValidator(logsDataSchema, dataValidator)
export const logsDataResolver = resolve<Logs, HookContext<LogsService>>({})

// NO patch/update schema — logs are append-only and immutable (GIIS 6.10.1)

// Schema for allowed query properties (read-only audit trail access)
export const logsQueryProperties = Type.Pick(logsSchema, [
  '_id',
  'userId',
  'patientId',
  'action',
  'timestamp',
  'resourceType',
  'resourceId',
  'status'
])
export const logsQuerySchema = Type.Intersect(
  [querySyntax(logsQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)
export type LogsQuery = Static<typeof logsQuerySchema>
export const logsQueryValidator = getValidator(logsQuerySchema, queryValidator)
export const logsQueryResolver = resolve<LogsQuery, HookContext<LogsService>>({})
