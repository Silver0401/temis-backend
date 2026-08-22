// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  templateDataValidator,
  templatePatchValidator,
  templateQueryValidator,
  templateResolver,
  templateExternalResolver,
  templateDataResolver,
  templatePatchResolver,
  templateQueryResolver
} from './template.schema'

import type { Application } from '../../declarations'
import { TemplateService, getOptions } from './template.class'
import { templatePath, templateMethods } from './template.shared'

export * from './template.class'
export * from './template.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const template = (app: Application) => {
  // Register our service on the Feathers application
  app.use(templatePath, new TemplateService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: templateMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(templatePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(templateExternalResolver),
        schemaHooks.resolveResult(templateResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(templateQueryValidator),
        schemaHooks.resolveQuery(templateQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(templateDataValidator),
        schemaHooks.resolveData(templateDataResolver)
      ],
      patch: [
        schemaHooks.validateData(templatePatchValidator),
        schemaHooks.resolveData(templatePatchResolver)
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
    [templatePath]: TemplateService
  }
}
