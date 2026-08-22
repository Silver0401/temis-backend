// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoMunicipiosDataValidator,
  catalogoMunicipiosPatchValidator,
  catalogoMunicipiosQueryValidator,
  catalogoMunicipiosResolver,
  catalogoMunicipiosExternalResolver,
  catalogoMunicipiosDataResolver,
  catalogoMunicipiosPatchResolver,
  catalogoMunicipiosQueryResolver
} from './catalogo-municipios.schema'

import type { Application } from '../../../declarations'
import { CatalogoMunicipiosService, getOptions } from './catalogo-municipios.class'
import { catalogoMunicipiosPath, catalogoMunicipiosMethods } from './catalogo-municipios.shared'

export * from './catalogo-municipios.class'
export * from './catalogo-municipios.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoMunicipios = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoMunicipiosPath, new CatalogoMunicipiosService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoMunicipiosMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoMunicipiosPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoMunicipiosExternalResolver),
        schemaHooks.resolveResult(catalogoMunicipiosResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoMunicipiosQueryValidator),
        schemaHooks.resolveQuery(catalogoMunicipiosQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoMunicipiosDataValidator),
        schemaHooks.resolveData(catalogoMunicipiosDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoMunicipiosPatchValidator),
        schemaHooks.resolveData(catalogoMunicipiosPatchResolver)
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
    [catalogoMunicipiosPath]: CatalogoMunicipiosService
  }
}
