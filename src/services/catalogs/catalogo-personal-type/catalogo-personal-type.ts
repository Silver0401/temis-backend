// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  catalogoPersonalTypeDataValidator,
  catalogoPersonalTypePatchValidator,
  catalogoPersonalTypeQueryValidator,
  catalogoPersonalTypeResolver,
  catalogoPersonalTypeExternalResolver,
  catalogoPersonalTypeDataResolver,
  catalogoPersonalTypePatchResolver,
  catalogoPersonalTypeQueryResolver
} from './catalogo-personal-type.schema'

import type { Application } from '../../../declarations'
import { CatalogoPersonalTypeService, getOptions } from './catalogo-personal-type.class'
import { catalogoPersonalTypePath, catalogoPersonalTypeMethods } from './catalogo-personal-type.shared'

export * from './catalogo-personal-type.class'
export * from './catalogo-personal-type.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const catalogoPersonalType = (app: Application) => {
  // Register our service on the Feathers application
  app.use(catalogoPersonalTypePath, new CatalogoPersonalTypeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: catalogoPersonalTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(catalogoPersonalTypePath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(catalogoPersonalTypeExternalResolver),
        schemaHooks.resolveResult(catalogoPersonalTypeResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(catalogoPersonalTypeQueryValidator),
        schemaHooks.resolveQuery(catalogoPersonalTypeQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(catalogoPersonalTypeDataValidator),
        schemaHooks.resolveData(catalogoPersonalTypeDataResolver)
      ],
      patch: [
        schemaHooks.validateData(catalogoPersonalTypePatchValidator),
        schemaHooks.resolveData(catalogoPersonalTypePatchResolver)
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
    [catalogoPersonalTypePath]: CatalogoPersonalTypeService
  }
}
