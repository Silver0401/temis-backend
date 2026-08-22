// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  drugsDataValidator,
  drugsPatchValidator,
  drugsQueryValidator,
  drugsResolver,
  drugsExternalResolver,
  drugsDataResolver,
  drugsPatchResolver,
  drugsQueryResolver
} from './drugs.schema'

import type { Application } from '../../declarations'
import { DrugsService, getOptions } from './drugs.class'
import { drugsPath, drugsMethods } from './drugs.shared'
import { scopeByPatientId, scopeByResourceId } from '../../hooks/generic/scope-by-clues'

export * from './drugs.class'
export * from './drugs.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const drugs = (app: Application) => {
  // Register our service on the Feathers application
  app.use(drugsPath, new DrugsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: drugsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(drugsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(drugsExternalResolver),
        schemaHooks.resolveResult(drugsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(drugsQueryValidator), schemaHooks.resolveQuery(drugsQueryResolver)],
      find: [scopeByPatientId],
      get: [scopeByPatientId],
      create: [
        schemaHooks.validateData(drugsDataValidator),
        schemaHooks.resolveData(drugsDataResolver)
      ],
      patch: [
        scopeByResourceId,
        schemaHooks.validateData(drugsPatchValidator),
        schemaHooks.resolveData(drugsPatchResolver)
      ],
      remove: [scopeByResourceId]
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
    [drugsPath]: DrugsService
  }
}
