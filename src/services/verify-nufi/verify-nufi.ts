import type { Application } from '../../declarations'
import { VerifyNufiService, getOptions } from './verify-nufi.class'
import { verifyNufiPath, verifyNufiMethods } from './verify-nufi.shared'
import { logError } from '../../hooks/generic/log-error'

export * from './verify-nufi.class'
export * from './verify-nufi.shared'

export const verifyNufi = (app: Application) => {
  app.use(verifyNufiPath, new VerifyNufiService(getOptions(app)), {
    methods: verifyNufiMethods,
    events: []
  })

  // NOTA: verify-nufi es PÚBLICO a propósito — se usa en la verificación de
  // identidad pre-registro (Account/VerifyID.tsx, noAuthService) antes de que el
  // usuario tenga token. Poner authenticate('jwt') aquí rompe el signup. El abuso
  // de la API de pago se contiene con el rate-limit por IP definido en app.ts.
  app.service(verifyNufiPath).hooks({
    around: {
      all: [],
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
    [verifyNufiPath]: VerifyNufiService
  }
}
