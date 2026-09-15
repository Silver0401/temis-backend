import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { SuiveService, getOptions } from './suive.class'
import {
  suiveDataResolver,
  suiveDataValidator,
  suiveExternalResolver,
  suiveQueryResolver,
  suiveQueryValidator,
  suiveResolver
} from './suive.schema'
import { suiveMethods, suivePath } from './suive.shared'

export * from './suive.class'
export * from './suive.schema'

export const suive = (app: Application) => {
  app.use(suivePath, new SuiveService(getOptions(app)), { methods: suiveMethods, events: [] })
  app.service(suivePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(suiveExternalResolver),
        schemaHooks.resolveResult(suiveResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(suiveQueryValidator), schemaHooks.resolveQuery(suiveQueryResolver)],
      create: [schemaHooks.validateData(suiveDataValidator), schemaHooks.resolveData(suiveDataResolver)]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [suivePath]: SuiveService
  }
}
