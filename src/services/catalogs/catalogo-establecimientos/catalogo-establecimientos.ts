// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoEstablecimientosDataValidator,
  catalogoEstablecimientosPatchValidator,
  catalogoEstablecimientosQueryValidator,
  catalogoEstablecimientosResolver,
  catalogoEstablecimientosExternalResolver,
  catalogoEstablecimientosDataResolver,
  catalogoEstablecimientosPatchResolver,
  catalogoEstablecimientosQueryResolver
} from './catalogo-establecimientos.schema'

import type { Application } from '../../../declarations'
import { CatalogoEstablecimientosService, getOptions } from './catalogo-establecimientos.class'
import {
  catalogoEstablecimientosPath,
  catalogoEstablecimientosMethods
} from './catalogo-establecimientos.shared'

export * from './catalogo-establecimientos.class'
export * from './catalogo-establecimientos.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoEstablecimientos = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoEstablecimientosPath, new CatalogoEstablecimientosService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoEstablecimientosMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoEstablecimientosPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoEstablecimientosExternalResolver),
        schemaHooks.resolveResult(catalogoEstablecimientosResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoEstablecimientosQueryValidator),
        schemaHooks.resolveQuery(catalogoEstablecimientosQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoEstablecimientosDataValidator),
        schemaHooks.resolveData(catalogoEstablecimientosDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoEstablecimientosPatchValidator),
        schemaHooks.resolveData(catalogoEstablecimientosPatchResolver)
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
    [catalogoEstablecimientosPath]: CatalogoEstablecimientosService
  }
}
