import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { MedicalTeamService, getOptions } from './medical-team.class'
import { medicalTeamDataValidator, medicalTeamPatchValidator } from './medical-team.schema'
import { medicalTeamMethods, medicalTeamPath } from './medical-team.shared'

export * from './medical-team.class'
export * from './medical-team.schema'
export * from './medical-team.shared'

export const medicalTeam = (app: Application) => {
  app.use(medicalTeamPath, new MedicalTeamService(getOptions(app)), {
    methods: medicalTeamMethods,
    events: []
  })

  app.service(medicalTeamPath).hooks({
    around: { all: [authenticate('jwt')] },
    before: {
      create: [schemaHooks.validateData(medicalTeamDataValidator)],
      patch: [schemaHooks.validateData(medicalTeamPatchValidator)]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [medicalTeamPath]: MedicalTeamService
  }
}
