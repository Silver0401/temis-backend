// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  imgsDataValidator,
  imgsPatchValidator,
  imgsQueryValidator,
  imgsResolver,
  imgsExternalResolver,
  imgsDataResolver,
  imgsPatchResolver,
  imgsQueryResolver
} from './imgs.schema'

import type { Application } from '../../declarations'
import { ImgsService, getOptions } from './imgs.class'
import { imgsPath, imgsMethods } from './imgs.shared'
import { bucket_save_img } from '../../hooks/bucket/bucket_save_img'
import { remove_img_temporally } from '../../hooks/bucket/remove_img_temporally'
import { populate_img_url } from '../../hooks/bucket/populate_img_url'
import { bucket_delete_img } from '../../hooks/bucket/bucket_delete_img'
import { scopeByPatientId, scopeByResourceId } from '../../hooks/generic/scope-by-clues'

export * from './imgs.class'
export * from './imgs.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const imgs = (app: Application) => {
  // Register our service on the Feathers application
  app.use(imgsPath, new ImgsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: imgsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(imgsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(imgsExternalResolver),
        schemaHooks.resolveResult(imgsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(imgsQueryValidator), schemaHooks.resolveQuery(imgsQueryResolver)],
      find: [scopeByPatientId],
      get: [scopeByPatientId],
      create: [
        schemaHooks.validateData(imgsDataValidator),
        schemaHooks.resolveData(imgsDataResolver),
        remove_img_temporally
      ],
      patch: [
        scopeByResourceId,
        schemaHooks.validateData(imgsPatchValidator),
        schemaHooks.resolveData(imgsPatchResolver)
      ],
      remove: [scopeByResourceId, bucket_delete_img]
    },
    after: {
      all: [],
      get: [populate_img_url],
      create: [bucket_save_img]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [imgsPath]: ImgsService
  }
}
