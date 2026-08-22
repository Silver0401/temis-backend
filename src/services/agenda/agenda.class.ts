// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions, AdapterId } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Agenda, AgendaData, AgendaPatch, AgendaQuery } from './agenda.schema'
import { GeneralError } from '@feathersjs/errors'

export type { Agenda, AgendaData, AgendaPatch, AgendaQuery }

export interface AgendaParams extends MongoDBAdapterParams<AgendaQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgendaService<ServiceParams extends Params = AgendaParams> extends MongoDBService<
  Agenda,
  AgendaData,
  AgendaParams,
  AgendaPatch
> {
  // @ts-ignore
  async get(_id: AdapterId, params: ServiceParams): Promise<Agenda[]> {
    // Obtener el ID del grupo desde los parámetros y Buscarlo
    const AgendaEvents = await this.find({
      // @ts-ignore
      query: {
        userId: params.user?._id
      }
    })
    return AgendaEvents.data
  }

  // @ts-ignore
  async patch(id: AdapterId, data: AgendaData, params?: ServiceParams): Promise<Agenda> {
    if (params?.query?.patchType === 'newEvent') {
      const newEventArray = data.appointments
      const prevAgenda = await this.find({
        // @ts-ignore
        query: {
          userId: params?.user?._id
        }
      })

      // @ts-ignore
      return super.patch(prevAgenda.data[0]._id, {
        ...prevAgenda.data[0],
        appointments: [
          ...prevAgenda.data[0].appointments,
          {
            id: newEventArray[0].id,
            startDate: newEventArray[0].startDate,
            endDate: newEventArray[0].endDate,
            patientId: newEventArray[0].patientId,
            patientName: newEventArray[0].patientName
          }
        ]
      })
    } else if (params?.query?.patchType === 'eventUpdate') {
      const modEventArray = data.appointments
      const prevAgenda = await this.find({
        // @ts-ignore
        query: {
          userId: params?.user?._id
        }
      })

      const listWithEventUpdated = prevAgenda.data[0].appointments.map((event) => {
        if (event.id === modEventArray[0].id) {
          return {
            ...event,
            startDate: modEventArray[0].startDate,
            endDate: modEventArray[0].endDate,
            patientId: modEventArray[0].patientId,
            patientName: modEventArray[0].patientName
          }
        } else return event
      })

      // @ts-ignore
      return super.patch(prevAgenda.data[0]._id, {
        ...prevAgenda.data[0],
        appointments: listWithEventUpdated
      })
    } else if (params?.query?.patchType === 'deleteEvent') {
      const modEventArray = data.appointments
      const prevAgenda = await this.find({
        // @ts-ignore
        query: {
          userId: params?.user?._id
        }
      })

      const listWithEventsUpdated = prevAgenda.data[0].appointments.filter((event) => {
        if (event.id === modEventArray[0].id) {
        } else return event
      })

      // @ts-ignore
      return super.patch(prevAgenda.data[0]._id, {
        ...prevAgenda.data[0],
        appointments: listWithEventsUpdated
      })
    } else {
      throw new GeneralError('Invalid patchType for agenda event provided')
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('agenda'))
      .then((collection) => {
        // Toda consulta de agenda filtra por userId (dueño).
        collection.createIndex({ userId: 1 })
        return collection
      })
  }
}
