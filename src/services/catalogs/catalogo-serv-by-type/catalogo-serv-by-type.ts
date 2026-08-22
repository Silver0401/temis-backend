// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoServByTypeDataValidator,
  catalogoServByTypePatchValidator,
  catalogoServByTypeQueryValidator,
  catalogoServByTypeResolver,
  catalogoServByTypeExternalResolver,
  catalogoServByTypeDataResolver,
  catalogoServByTypePatchResolver,
  catalogoServByTypeQueryResolver
} from './catalogo-serv-by-type.schema'

import type { Application } from '../../../declarations'
import { CatalogoServByTypeService, getOptions } from './catalogo-serv-by-type.class'
import { catalogoServByTypePath, catalogoServByTypeMethods } from './catalogo-serv-by-type.shared'

export * from './catalogo-serv-by-type.class'
export * from './catalogo-serv-by-type.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoServByType = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoServByTypePath, new CatalogoServByTypeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoServByTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoServByTypePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(catalogoServByTypeExternalResolver),
        schemaHooks.resolveResult(catalogoServByTypeResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoServByTypeQueryValidator),
        schemaHooks.resolveQuery(catalogoServByTypeQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoServByTypeDataValidator),
        schemaHooks.resolveData(catalogoServByTypeDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoServByTypePatchValidator),
        schemaHooks.resolveData(catalogoServByTypePatchResolver)
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
    [catalogoServByTypePath]: CatalogoServByTypeService
  }
}
