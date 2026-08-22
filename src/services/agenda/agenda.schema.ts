// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AgendaService } from './agenda.class'

// Main data model schema
export const agendaSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    appointments: Type.Array(
      Type.Object({
        id: Type.String(),
        patientName: Type.String(),
        patientId: Type.String(),
        startDate: Type.String(),
        endDate: Type.String()
      })
    )
  },
  { $id: 'Agenda', additionalProperties: false }
)
export type Agenda = Static<typeof agendaSchema>
export const agendaValidator = getValidator(agendaSchema, dataValidator)
export const agendaResolver = resolve<Agenda, HookContext<AgendaService>>({})

export const agendaExternalResolver = resolve<Agenda, HookContext<AgendaService>>({})

// Schema for creating new entries
export const agendaDataSchema = Type.Pick(agendaSchema, ['appointments'], {
  $id: 'AgendaData'
})
export type AgendaData = Static<typeof agendaDataSchema>
export const agendaDataValidator = getValidator(agendaDataSchema, dataValidator)
export const agendaDataResolver = resolve<Agenda, HookContext<AgendaService>>({})

// Schema for updating existing entries
export const agendaPatchSchema = Type.Partial(agendaSchema, {
  $id: 'AgendaPatch'
})
export type AgendaPatch = Static<typeof agendaPatchSchema>
export const agendaPatchValidator = getValidator(agendaPatchSchema, dataValidator)
export const agendaPatchResolver = resolve<Agenda, HookContext<AgendaService>>({})

// Schema for allowed query properties
export const agendaQueryProperties = Type.Pick(agendaSchema, ['_id', 'userId', 'appointments'])
export const agendaQuerySchema = Type.Intersect(
  [
    querySyntax(agendaQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        patchType: Type.Optional(
          Type.Union([Type.Literal('newEvent'), Type.Literal('eventUpdate'), Type.Literal('deleteEvent')])
        )
      },
      { additionalProperties: true }
    )
  ],
  { additionalProperties: false }
)
export type AgendaQuery = Static<typeof agendaQuerySchema>
export const agendaQueryValidator = getValidator(agendaQuerySchema, queryValidator)
export const agendaQueryResolver = resolve<AgendaQuery, HookContext<AgendaService>>({})
