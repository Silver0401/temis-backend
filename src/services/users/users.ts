import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema'

import type { Application } from '../../declarations'
import { UserService, getOptions } from './users.class'
import { userPath, userMethods } from './users.shared'
import { checkUserIdentity } from '../../hooks/users/check-user-identity'

export * from './users.class'
export * from './users.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: ['devicesConnected']
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        // Un integrante de equipo lo da de alta su tutor: no pasa por la
        // verificación de identidad (INE/CURP) del alta de médico.
        async (context) =>
          context.params.internalSubuserRole || context.params.internalSeed
            ? context
            : checkUserIdentity(context)
      ],
      patch: [schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })

  app.service(userPath).publish('devicesConnected', (data, _context) => {
    // @ts-ignore
    return app.channel(`user/${data.userId}`)
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
