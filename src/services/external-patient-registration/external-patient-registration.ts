import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { ExternalPatientRegistrationService, getOptions } from './external-patient-registration.class'
import { externalPatientRegistrationDataValidator } from './external-patient-registration.schema'
import {
  externalPatientRegistrationMethods,
  externalPatientRegistrationPath
} from './external-patient-registration.shared'

export * from './external-patient-registration.class'
export * from './external-patient-registration.schema'
export * from './external-patient-registration.shared'

export const externalPatientRegistration = (app: Application) => {
  app.use(
    externalPatientRegistrationPath,
    new ExternalPatientRegistrationService(getOptions(app)),
    { methods: externalPatientRegistrationMethods, events: [] }
  )

  // Público a propósito: solo expone create con payload cerrado. El doctorId
  // identifica el destino del alta, pero nunca habilita lectura ni modificación.
  app.service(externalPatientRegistrationPath).hooks({
    before: { create: [schemaHooks.validateData(externalPatientRegistrationDataValidator)] },
    after: { all: [] },
    error: { all: [] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [externalPatientRegistrationPath]: ExternalPatientRegistrationService
  }
}
