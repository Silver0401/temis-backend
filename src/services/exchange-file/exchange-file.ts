// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  exchangeFileDataValidator,
  exchangeFilePatchValidator,
  exchangeFileQueryValidator,
  exchangeFileResolver,
  exchangeFileExternalResolver,
  exchangeFileDataResolver,
  exchangeFilePatchResolver,
  exchangeFileQueryResolver
} from './exchange-file.schema'

import type { Application } from '../../declarations'
import { ExchangeFileService, getOptions } from './exchange-file.class'
import { exchangeFilePath, exchangeFileMethods } from './exchange-file.shared'

export * from './exchange-file.class'
export * from './exchange-file.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const exchangeFile = (app: Application) => {
  // Register our service on the Feathers application
  app.use(exchangeFilePath, new ExchangeFileService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: exchangeFileMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(exchangeFilePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(exchangeFileExternalResolver),
        schemaHooks.resolveResult(exchangeFileResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(exchangeFileQueryValidator),
        schemaHooks.resolveQuery(exchangeFileQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(exchangeFileDataValidator),
        schemaHooks.resolveData(exchangeFileDataResolver)
      ],
      patch: [
        schemaHooks.validateData(exchangeFilePatchValidator),
        schemaHooks.resolveData(exchangeFilePatchResolver)
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
declare module '../../declarations' {
  interface ServiceTypes {
    [exchangeFilePath]: ExchangeFileService
  }
}
