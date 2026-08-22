// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { MethodNotAllowed } from '@feathersjs/errors'

import {
  logsDataValidator,
  logsQueryValidator,
  logsResolver,
  logsExternalResolver,
  logsDataResolver,
  logsQueryResolver
} from './logs.schema'

import type { Application } from '../../declarations'
import { LogsService, getOptions } from './logs.class'
import { logsPath, logsMethods } from './logs.shared'
import { Add_User_To_Log } from '../../hooks/logs/AddUserToLog'

export * from './logs.class'
export * from './logs.schema'

// Hook that makes audit logs immutable — GIIS Control 6.10.1 requires logs cannot be altered or deleted
const rejectMutation = async () => {
  throw new MethodNotAllowed('Audit logs are immutable and cannot be modified or deleted')
}

// A configure function that registers the service and its hooks via `app.configure`
export const logs = (app: Application) => {
  // Register our service on the Feathers application
  app.use(logsPath, new LogsService(getOptions(app)), {
    // Only expose find, get, and create — no patch or remove
    methods: logsMethods,
    events: []
  })
  // Initialize hooks
  app.service(logsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(logsExternalResolver),
        schemaHooks.resolveResult(logsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(logsQueryValidator), schemaHooks.resolveQuery(logsQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(logsDataValidator),
        schemaHooks.resolveData(logsDataResolver),
        Add_User_To_Log
      ],
      // Immutability enforcement — logs must never be modified or removed
      patch: [
        // rejectMutation
      ],
      remove: [
        // rejectMutation
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [logsPath]: LogsService
  }
}
