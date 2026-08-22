import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { logError } from '../../hooks/generic/log-error'
import { ConsentsService, getOptions } from './consents.class'
import { consentDataValidator, consentQueryValidator } from './consents.schema'
import { consentsMethods, consentsPath } from './consents.shared'

export * from './consents.class'
export * from './consents.schema'
export * from './consents.shared'

export const consents = (app: Application) => {
  app.use(consentsPath, new ConsentsService(getOptions(app)), {
    methods: consentsMethods,
    events: []
  })

  app.get('mongodbClient').then((db) => {
    db.collection('consents').createIndex({ token: 1 }, { unique: true })
  })

  app.service(consentsPath).hooks({
    around: { all: [logError, authenticate('jwt')] },
    before: {
      all: [schemaHooks.validateQuery(consentQueryValidator)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(consentDataValidator)]
    },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [consentsPath]: ConsentsService
  }
}
