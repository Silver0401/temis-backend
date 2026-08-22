// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoEntFedDataValidator,
  catalogoEntFedPatchValidator,
  catalogoEntFedQueryValidator,
  catalogoEntFedResolver,
  catalogoEntFedExternalResolver,
  catalogoEntFedDataResolver,
  catalogoEntFedPatchResolver,
  catalogoEntFedQueryResolver
} from './catalogo-ent-fed.schema'

import type { Application } from '../../../declarations'
import { CatalogoEntFedService, getOptions } from './catalogo-ent-fed.class'
import { catalogoEntFedPath, catalogoEntFedMethods } from './catalogo-ent-fed.shared'

export * from './catalogo-ent-fed.class'
export * from './catalogo-ent-fed.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoEntFed = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoEntFedPath, new CatalogoEntFedService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoEntFedMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoEntFedPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoEntFedExternalResolver),
        schemaHooks.resolveResult(catalogoEntFedResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoEntFedQueryValidator),
        schemaHooks.resolveQuery(catalogoEntFedQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoEntFedDataValidator),
        schemaHooks.resolveData(catalogoEntFedDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoEntFedPatchValidator),
        schemaHooks.resolveData(catalogoEntFedPatchResolver)
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
declare module '../../../declarations' {
  interface ServiceTypes {
    [catalogoEntFedPath]: CatalogoEntFedService
  }
}
