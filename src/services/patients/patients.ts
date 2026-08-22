// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  patientsDataValidator,
  patientsPatchValidator,
  patientsQueryValidator,
  patientsResolver,
  patientsExternalResolver,
  patientsDataResolver,
  patientsPatchResolver,
  patientsQueryResolver
} from './patients.schema'

import type { Application } from '../../declarations'
import { PatientsService, getOptions } from './patients.class'
import { patientsPath, patientsMethods } from './patients.shared'
import { updateUserPatients } from '../../hooks/patients/update-user-patients'
import { duplicatePatientAnalyzer } from '../../hooks/patients/duplicate-patient-analyzer'
import { delete_patient_files } from '../../hooks/patients/delete_patient_files'
import { patientIdDataValidator } from '../../hooks/records/patient-id-data-validator'
import { scopePatientsFind, scopePatientsWrite } from '../../hooks/generic/scope-by-clues'
// import { hospitalIdsRetriever } from '../../hooks/patients/hospital-ids-retriever'

export * from './patients.class'
export * from './patients.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const patients = (app: Application) => {
  // Register our service on the Feathers application
  app.use(patientsPath, new PatientsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: patientsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(patientsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(patientsExternalResolver),
        schemaHooks.resolveResult(patientsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(patientsQueryValidator),
        schemaHooks.resolveQuery(patientsQueryResolver)
      ],
      find: [scopePatientsFind],
      get: [],
      create: [
        schemaHooks.validateData(patientsDataValidator),
        schemaHooks.resolveData(patientsDataResolver),
        patientIdDataValidator,
        duplicatePatientAnalyzer
      ],
      patch: [
        scopePatientsWrite,
        schemaHooks.validateData(patientsPatchValidator),
        schemaHooks.resolveData(patientsPatchResolver)
      ],
      remove: [scopePatientsWrite, delete_patient_files]
    },
    after: {
      all: [],
      get: [],
      create: [updateUserPatients]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [patientsPath]: PatientsService
  }
}
