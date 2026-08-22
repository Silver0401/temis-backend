// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { GoogleApiService, getOptions } from './google-api.class'
import { googleApiPath, googleApiMethods } from './google-api.shared'
import { logError } from '../../hooks/generic/log-error'

export * from './google-api.class'
export * from './google-api.shared'

export const googleApi = (app: Application) => {
  app.use(googleApiPath, new GoogleApiService(getOptions(app)), {
    methods: googleApiMethods,
    events: []
  })

  app.service(googleApiPath).hooks({
    around: {
      all: [
        // authenticate('jwt')
      ],
      create: [logError]
    },
    before: {
      create: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [googleApiPath]: GoogleApiService
  }
}
