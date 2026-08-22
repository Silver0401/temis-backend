// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoAfiliacionesDataValidator,
  catalogoAfiliacionesPatchValidator,
  catalogoAfiliacionesQueryValidator,
  catalogoAfiliacionesResolver,
  catalogoAfiliacionesExternalResolver,
  catalogoAfiliacionesDataResolver,
  catalogoAfiliacionesPatchResolver,
  catalogoAfiliacionesQueryResolver
} from './catalogo-afiliaciones.schema'

import type { Application } from './../../../declarations'
import { CatalogoAfiliacionesService, getOptions } from './catalogo-afiliaciones.class'
import { catalogoAfiliacionesPath, catalogoAfiliacionesMethods } from './catalogo-afiliaciones.shared'

export * from './catalogo-afiliaciones.class'
export * from './catalogo-afiliaciones.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoAfiliaciones = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoAfiliacionesPath, new CatalogoAfiliacionesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoAfiliacionesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoAfiliacionesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoAfiliacionesExternalResolver),
        schemaHooks.resolveResult(catalogoAfiliacionesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoAfiliacionesQueryValidator),
        schemaHooks.resolveQuery(catalogoAfiliacionesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoAfiliacionesDataValidator),
        schemaHooks.resolveData(catalogoAfiliacionesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoAfiliacionesPatchValidator),
        schemaHooks.resolveData(catalogoAfiliacionesPatchResolver)
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
declare module './../../../declarations' {
  interface ServiceTypes {
    [catalogoAfiliacionesPath]: CatalogoAfiliacionesService
  }
}
