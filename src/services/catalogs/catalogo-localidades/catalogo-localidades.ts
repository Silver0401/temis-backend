// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoLocalidadesDataValidator,
  catalogoLocalidadesPatchValidator,
  catalogoLocalidadesQueryValidator,
  catalogoLocalidadesResolver,
  catalogoLocalidadesExternalResolver,
  catalogoLocalidadesDataResolver,
  catalogoLocalidadesPatchResolver,
  catalogoLocalidadesQueryResolver
} from './catalogo-localidades.schema'

import type { Application } from '../../../declarations'
import { CatalogoLocalidadesService, getOptions } from './catalogo-localidades.class'
import { catalogoLocalidadesPath, catalogoLocalidadesMethods } from './catalogo-localidades.shared'

export * from './catalogo-localidades.class'
export * from './catalogo-localidades.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoLocalidades = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoLocalidadesPath, new CatalogoLocalidadesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoLocalidadesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoLocalidadesPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoLocalidadesExternalResolver),
        schemaHooks.resolveResult(catalogoLocalidadesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoLocalidadesQueryValidator),
        schemaHooks.resolveQuery(catalogoLocalidadesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoLocalidadesDataValidator),
        schemaHooks.resolveData(catalogoLocalidadesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoLocalidadesPatchValidator),
        schemaHooks.resolveData(catalogoLocalidadesPatchResolver)
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
    [catalogoLocalidadesPath]: CatalogoLocalidadesService
  }
}
