import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { AdminConsoleService, getOptions } from './admin-console.class'
import { adminConsolePath, adminConsoleMethods } from './admin-console.shared'

export * from './admin-console.class'

export const adminConsole = (app: Application) => {
  app.use(adminConsolePath, new AdminConsoleService(getOptions(app)), {
    methods: adminConsoleMethods,
    events: []
  })
  app.service(adminConsolePath).hooks({
    around: { all: [authenticate('jwt')] },
    before: { all: [] },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [adminConsolePath]: AdminConsoleService
  }
}
