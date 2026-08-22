// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  noAuthTemplateDataValidator,
  noAuthTemplatePatchValidator,
  noAuthTemplateQueryValidator,
  noAuthTemplateResolver,
  noAuthTemplateExternalResolver,
  noAuthTemplateDataResolver,
  noAuthTemplatePatchResolver,
  noAuthTemplateQueryResolver
} from './no-auth-template.schema'

import type { Application } from '../../declarations'
import { NoAuthTemplateService, getOptions } from './no-auth-template.class'
import { noAuthTemplatePath, noAuthTemplateMethods } from './no-auth-template.shared'

export * from './no-auth-template.class'
export * from './no-auth-template.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const noAuthTemplate = (app: Application) => {
  // Register our service on the Feathers application
  app.use(noAuthTemplatePath, new NoAuthTemplateService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: noAuthTemplateMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(noAuthTemplatePath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(noAuthTemplateExternalResolver),
        schemaHooks.resolveResult(noAuthTemplateResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(noAuthTemplateQueryValidator),
        schemaHooks.resolveQuery(noAuthTemplateQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(noAuthTemplateDataValidator),
        schemaHooks.resolveData(noAuthTemplateDataResolver)
      ],
      patch: [
        schemaHooks.validateData(noAuthTemplatePatchValidator),
        schemaHooks.resolveData(noAuthTemplatePatchResolver)
      ],
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
    [noAuthTemplatePath]: NoAuthTemplateService
  }
}
