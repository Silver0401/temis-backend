// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/koa'
import { ApplicationConfiguration } from './configuration'

import { User, UserRole } from './services/users/users'

export type { NextFunction }

// The types for app.get(name) and app.set(name)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>

// Add the user as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    user?: User
    // Alta interna de un integrante de equipo desde `medical-team`: marca el
    // rol y el tutor sin pasar por el flujo público de registro de médico.
    internalSubuserRole?: Extract<UserRole, 'enfermeria'>
    internalTutorId?: User['_id']
    // Alta administrativa desde src/scripts/seed-admin.ts: salta la verificacion
    // de identidad (INE/CURP), que solo aplica al registro publico de medico.
    internalSeed?: boolean
  }
}
