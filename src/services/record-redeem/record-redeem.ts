import type { Application } from '../../declarations'
import { RecordRedeemService, getOptions } from './record-redeem.class'
import { recordRedeemPath, recordRedeemMethods } from './record-redeem.shared'
import { logError } from '../../hooks/generic/log-error'

export * from './record-redeem.class'
export * from './record-redeem.shared'

export const recordRedeem = (app: Application) => {
  app.use(recordRedeemPath, new RecordRedeemService(getOptions(app)), {
    methods: recordRedeemMethods,
    events: []
  })

  // PÚBLICO a propósito (el consultante puede no tener sesión y llegar por NUFI).
  // La protección contra fuerza bruta de la contraseña es el rate-limit de app.ts
  // más el límite de intentos por token.
  app.service(recordRedeemPath).hooks({
    around: { all: [logError] },
    before: { all: [] },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [recordRedeemPath]: RecordRedeemService
  }
}
