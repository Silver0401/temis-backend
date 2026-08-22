// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { guideRouter } from '../../hooks/guide-router'
import { patientIdDataValidator } from '../../hooks/records/patient-id-data-validator'
import { cieDiagnosticValidator } from '../../hooks/records/cie-diagnostic-validator'
import { persistNewPatient } from '../../hooks/records/persist-new-patient'
import { synthesizePreview } from '../../hooks/records/synthesize-preview'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  recordsDataValidator,
  recordsPatchValidator,
  recordsQueryValidator,
  recordsResolver,
  recordsExternalResolver,
  recordsDataResolver,
  recordsPatchResolver,
  recordsQueryResolver
} from './records.schema'

import type { Application } from '../../declarations'
import { RecordsService, getOptions } from './records.class'
import { recordsPath, recordsMethods } from './records.shared'
import { buildPatientFromIdentification } from '../../hooks/records/build-patient-from-identification'
import { scopeByPatientId, scopeByResourceId } from '../../hooks/generic/scope-by-clues'

export * from './records.class'
export * from './records.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const records = (app: Application) => {
  // Register our service on the Feathers application
  app.use(recordsPath, new RecordsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: recordsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(recordsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(recordsExternalResolver),
        schemaHooks.resolveResult(recordsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(recordsQueryValidator), schemaHooks.resolveQuery(recordsQueryResolver)],
      find: [scopeByPatientId],
      get: [scopeByPatientId],
      // Alta de un registro clínico, en orden. Cada paso asume que el anterior
      // pasó, y ninguno persiste nada hasta el último.
      //
      //   1. paciente     — traduce la ficha de identificación a `personalInfo`
      //   2. identidad    — valida nombres, CURP y fecha de nacimiento
      //   3. diagnósticos — valida los CIE contra el catálogo (sexo y edad)
      //   4. guías        — arma el formulario GIIS  ·  solo en modo síntesis
      //   5. previsualiza — devuelve el formulario y corta  ·  solo en síntesis
      //   6. persiste     — crea el paciente y le cuelga el registro
      //
      // El modo síntesis es la primera mitad del alta: el médico escribe la
      // nota, el backend le responde qué debe capturar, y solo la segunda
      // llamada —ya sin `synthesize`— guarda lo que el médico confirmó.
      create: [
        schemaHooks.validateData(recordsDataValidator),
        schemaHooks.resolveData(recordsDataResolver),
        buildPatientFromIdentification,
        patientIdDataValidator,
        cieDiagnosticValidator,
        guideRouter,
        synthesizePreview,
        persistNewPatient
      ],
      patch: [
        scopeByResourceId,
        schemaHooks.validateData(recordsPatchValidator),
        schemaHooks.resolveData(recordsPatchResolver)
      ],
      remove: [scopeByResourceId]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [recordsPath]: RecordsService
  }
}
