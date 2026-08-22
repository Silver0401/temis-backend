// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  agendaDataValidator,
  agendaPatchValidator,
  agendaQueryValidator,
  agendaResolver,
  agendaExternalResolver,
  agendaDataResolver,
  agendaPatchResolver,
  agendaQueryResolver
} from './agenda.schema'

import type { Application } from '../../declarations'
import { AgendaService, getOptions } from './agenda.class'
import { agendaPath, agendaMethods } from './agenda.shared'

export * from './agenda.class'
export * from './agenda.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const agenda = (app: Application) => {
  // Register our service on the Feathers application
  app.use(agendaPath, new AgendaService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agendaMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(agendaPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(agendaExternalResolver),
        schemaHooks.resolveResult(agendaResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(agendaQueryValidator), schemaHooks.resolveQuery(agendaQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(agendaDataValidator), schemaHooks.resolveData(agendaDataResolver)],
      patch: [schemaHooks.validateData(agendaPatchValidator), schemaHooks.resolveData(agendaPatchResolver)],
      remove: []
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
    [agendaPath]: AgendaService
  }
}
