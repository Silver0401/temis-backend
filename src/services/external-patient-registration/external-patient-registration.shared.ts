// For more information about this file see https://dove.feathersjs/guides/cli/service.shared.html
import type { ClientApplication } from '../../client'
import type { ExternalPatientRegistrationService } from './external-patient-registration.class'
import type {
  ExternalPatientRegistrationData,
  ExternalPatientRegistrationResult
} from './external-patient-registration.schema'

export type { ExternalPatientRegistrationData, ExternalPatientRegistrationResult }

export type ExternalPatientRegistrationClientService = Pick<ExternalPatientRegistrationService, 'create'>

export const externalPatientRegistrationPath = 'external-patient-registration'

export const externalPatientRegistrationMethods: Array<'create'> = ['create']

export const externalPatientRegistrationClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(externalPatientRegistrationPath, connection.service(externalPatientRegistrationPath), {
    methods: externalPatientRegistrationMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [externalPatientRegistrationPath]: ExternalPatientRegistrationClientService
  }
}
