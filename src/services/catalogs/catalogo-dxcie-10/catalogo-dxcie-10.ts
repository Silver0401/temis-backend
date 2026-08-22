// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoDxcie10DataValidator,
  catalogoDxcie10PatchValidator,
  catalogoDxcie10QueryValidator,
  catalogoDxcie10Resolver,
  catalogoDxcie10ExternalResolver,
  catalogoDxcie10DataResolver,
  catalogoDxcie10PatchResolver,
  catalogoDxcie10QueryResolver
} from './catalogo-dxcie-10.schema'

import type { Application } from '../../../declarations'
import { CatalogoDxcie10Service, getOptions } from './catalogo-dxcie-10.class'
import { catalogoDxcie10Path, catalogoDxcie10Methods } from './catalogo-dxcie-10.shared'

export * from './catalogo-dxcie-10.class'
export * from './catalogo-dxcie-10.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoDxcie10 = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoDxcie10Path, new CatalogoDxcie10Service(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoDxcie10Methods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoDxcie10Path).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoDxcie10ExternalResolver),
        schemaHooks.resolveResult(catalogoDxcie10Resolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoDxcie10QueryValidator),
        schemaHooks.resolveQuery(catalogoDxcie10QueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoDxcie10DataValidator),
        schemaHooks.resolveData(catalogoDxcie10DataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoDxcie10PatchValidator),
        schemaHooks.resolveData(catalogoDxcie10PatchResolver)
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
    [catalogoDxcie10Path]: CatalogoDxcie10Service
  }
}
