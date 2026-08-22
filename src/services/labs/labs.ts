// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  labsDataValidator,
  labsPatchValidator,
  labsQueryValidator,
  labsResolver,
  labsExternalResolver,
  labsDataResolver,
  labsPatchResolver,
  labsQueryResolver
} from './labs.schema'

import type { Application } from '../../declarations'
import { LabsService, getOptions } from './labs.class'
import { labsPath, labsMethods } from './labs.shared'
import { scopeByPatientId, scopeByResourceId } from '../../hooks/generic/scope-by-clues'

export * from './labs.class'
export * from './labs.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const labs = (app: Application) => {
  // Register our service on the Feathers application
  app.use(labsPath, new LabsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: labsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(labsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(labsExternalResolver),
        schemaHooks.resolveResult(labsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(labsQueryValidator), schemaHooks.resolveQuery(labsQueryResolver)],
      find: [scopeByPatientId],
      get: [scopeByPatientId],
      create: [
        schemaHooks.validateData(labsDataValidator),
        schemaHooks.resolveData(labsDataResolver)
      ],
      patch: [
        scopeByResourceId,
        schemaHooks.validateData(labsPatchValidator),
        schemaHooks.resolveData(labsPatchResolver)
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
    [labsPath]: LabsService
  }
}
