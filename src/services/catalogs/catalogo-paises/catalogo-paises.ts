// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoPaisesDataValidator,
  catalogoPaisesPatchValidator,
  catalogoPaisesQueryValidator,
  catalogoPaisesResolver,
  catalogoPaisesExternalResolver,
  catalogoPaisesDataResolver,
  catalogoPaisesPatchResolver,
  catalogoPaisesQueryResolver
} from './catalogo-paises.schema'

import type { Application } from '../../../declarations'
import { CatalogoPaisesService, getOptions } from './catalogo-paises.class'
import { catalogoPaisesPath, catalogoPaisesMethods } from './catalogo-paises.shared'

export * from './catalogo-paises.class'
export * from './catalogo-paises.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoPaises = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoPaisesPath, new CatalogoPaisesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoPaisesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoPaisesPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoPaisesExternalResolver),
        schemaHooks.resolveResult(catalogoPaisesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoPaisesQueryValidator),
        schemaHooks.resolveQuery(catalogoPaisesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoPaisesDataValidator),
        schemaHooks.resolveData(catalogoPaisesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoPaisesPatchValidator),
        schemaHooks.resolveData(catalogoPaisesPatchResolver)
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
    [catalogoPaisesPath]: CatalogoPaisesService
  }
}
