// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  groupsDataValidator,
  groupsPatchValidator,
  groupsQueryValidator,
  groupsResolver,
  groupsExternalResolver,
  groupsDataResolver,
  groupsPatchResolver,
  groupsQueryResolver
} from './groups.schema'

import type { Application } from '../../declarations'
import { GroupsService, getOptions } from './groups.class'
import { groupsPath, groupsMethods } from './groups.shared'
import { add_group_admin } from '../../hooks/groups/add_group_admin'
import { update_user_groups } from '../../hooks/groups/update_user_groups'
import { populate_patients } from '../../hooks/groups/populate_patients'
import { delete_group_from_user } from '../../hooks/patients/delete_group_from_user'

export * from './groups.class'
export * from './groups.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const groups = (app: Application) => {
  // Register our service on the Feathers application
  app.use(groupsPath, new GroupsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: groupsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(groupsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(groupsExternalResolver),
        schemaHooks.resolveResult(groupsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(groupsQueryValidator), schemaHooks.resolveQuery(groupsQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(groupsDataValidator),
        schemaHooks.resolveData(groupsDataResolver),
        add_group_admin
      ],
      patch: [schemaHooks.validateData(groupsPatchValidator), schemaHooks.resolveData(groupsPatchResolver)],
      remove: []
    },
    after: {
      all: [],
      get: [populate_patients],
      create: [update_user_groups],
      remove: [delete_group_from_user]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [groupsPath]: GroupsService
  }
}
