import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { RecordShareService, getOptions } from './record-share.class'
import { recordSharePath, recordShareMethods } from './record-share.shared'
import { logError } from '../../hooks/generic/log-error'

export * from './record-share.class'
export * from './record-share.shared'

export const recordShare = (app: Application) => {
  app.use(recordSharePath, new RecordShareService(getOptions(app)), {
    methods: recordShareMethods,
    events: []
  })

  // Índice para la búsqueda por token en el canje, y unicidad del token.
  app.get('mongodbClient').then((db) => {
    db.collection('record_shares').createIndex({ token: 1 }, { unique: true })
  })

  app.service(recordSharePath).hooks({
    around: {
      all: [logError],
      // Emitir un link exige sesión de médico.
      create: [authenticate('jwt')]
    },
    before: { all: [] },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [recordSharePath]: RecordShareService
  }
}
