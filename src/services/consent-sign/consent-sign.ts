import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { logError } from '../../hooks/generic/log-error'
import { ConsentSignService, getOptions } from './consent-sign.class'
import { consentSignDataValidator, consentSignQueryValidator } from './consent-sign.schema'
import { consentSignMethods, consentSignPath } from './consent-sign.shared'

export * from './consent-sign.class'
export * from './consent-sign.schema'
export * from './consent-sign.shared'

export const consentSign = (app: Application) => {
  app.use(consentSignPath, new ConsentSignService(getOptions(app)), {
    methods: consentSignMethods,
    events: []
  })

  // PÚBLICO a propósito: el paciente llega por un link sin sesión.
  // SEGURIDAD: nunca emite JWT ni abre otros servicios; solo lee el documento
  // asociado al token vigente y la transición de firma es atómica y de un solo uso.
  // El rate-limit por IP se aplica en app.ts.
  app.service(consentSignPath).hooks({
    around: { all: [logError] },
    before: {
      all: [schemaHooks.validateQuery(consentSignQueryValidator)],
      get: [],
      create: [schemaHooks.validateData(consentSignDataValidator)]
    },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [consentSignPath]: ConsentSignService
  }
}
