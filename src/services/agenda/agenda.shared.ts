// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Agenda, AgendaData, AgendaPatch, AgendaQuery, AgendaService } from './agenda.class'

export type { Agenda, AgendaData, AgendaPatch, AgendaQuery }

export type AgendaClientService = Pick<AgendaService<Params<AgendaQuery>>, (typeof agendaMethods)[number]>

export const agendaPath = 'agenda'

export const agendaMethods: Array<keyof AgendaService> = ['find', 'get', 'create', 'patch', 'remove']

export const agendaClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(agendaPath, connection.service(agendaPath), {
    methods: agendaMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [agendaPath]: AgendaClientService
  }
}
