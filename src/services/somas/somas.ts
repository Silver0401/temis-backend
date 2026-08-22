// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  somasDataValidator,
  somasPatchValidator,
  somasQueryValidator,
  somasResolver,
  somasExternalResolver,
  somasDataResolver,
  somasPatchResolver,
  somasQueryResolver
} from './somas.schema'

import type { Application, HookContext } from '../../declarations'
import { SomasService, getOptions } from './somas.class'
import { somasPath, somasMethods } from './somas.shared'
import { build_somas_from_values } from '../../hooks/somas/build_somas_from_values'
import { giissomatometryValidator } from '../../hooks/records/giis-somatometry-validator'
import { scopeByPatientId, scopeByResourceId } from '../../hooks/generic/scope-by-clues'

export * from './somas.class'
export * from './somas.schema'

// A configure function that registers the service and its hooks via `app.configure`
/**
 * `validateOnly` es la pasada previa del formulario: corre las validaciones y
 * devuelve los valores normalizados sin escribir nada en Mongo.
 */
const skipCreateIfValidateOnly = async (context: HookContext) => {
  if (context.params.query?.validateOnly) {
    context.result = { values: (context.data as any).values ?? null }
  }
  return context
}

export const somas = (app: Application) => {
  // Register our service on the Feathers application
  app.use(somasPath, new SomasService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: somasMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(somasPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(somasExternalResolver),
        schemaHooks.resolveResult(somasResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(somasQueryValidator), schemaHooks.resolveQuery(somasQueryResolver)],
      find: [scopeByPatientId],
      get: [scopeByPatientId],
      create: [
        schemaHooks.validateData(somasDataValidator),
        schemaHooks.resolveData(somasDataResolver),
        build_somas_from_values,
        giissomatometryValidator,
        skipCreateIfValidateOnly
      ],
      patch: [
        scopeByResourceId,
        schemaHooks.validateData(somasPatchValidator),
        schemaHooks.resolveData(somasPatchResolver)
      ],
      remove: [scopeByResourceId]
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
    [somasPath]: SomasService
  }
}
