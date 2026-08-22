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
  /**
   * La agenda del médico, creándola si todavía no existe.
   *
   * NADA creaba nunca este documento: `create` no tiene resolver que fije
   * `userId` y no hay hook de alta de usuario que lo siembre, así que la
   * colección estaba vacía. Con `data[0]` indefinido, agendar reventaba en los
   * dos extremos —aquí al hacer `prevAgenda.data[0]._id` y en el frontend al
   * leer `data.data[0]._id`— y el modal simplemente no hacía nada al elegir
   * paciente. Se crea a demanda, que además cubre a cualquier cuenta nueva.
   *
   * Se inserta contra la colección y no vía `create` a propósito: el esquema de
   * alta solo admite `appointments`, así que por esa vía el documento nacería
   * sin dueño.
   */
  private async agendaDelUsuario(params: any): Promise<Agenda> {
    const userId = params?.user?._id
    if (!userId) throw new GeneralError('No hay usuario autenticado para resolver la agenda')

    const existentes = await this.find({
      // @ts-ignore
      query: { userId }
    })
    if (existentes.data.length > 0) return existentes.data[0]

    const collection = await this.getModel(params)
    const nueva = { userId, appointments: [] }
    const { insertedId } = await collection.insertOne(nueva as any)
    return { ...nueva, _id: insertedId } as unknown as Agenda
  }

  /**
   * `super.patch` con el documento entero incluía `_id`, y MongoDB rechaza
   * cualquier `$set` sobre ese campo por inmutable. Se manda solo lo que cambia.
   */
  private async guardarCitas(agenda: Agenda, appointments: Agenda['appointments']) {
    // @ts-ignore
    return super.patch(agenda._id, { appointments })
  }

  // @ts-ignore
  async get(_id: AdapterId, params: ServiceParams): Promise<Agenda[]> {
    // Devuelve siempre un elemento: si el médico aún no tiene agenda, se crea.
    return [await this.agendaDelUsuario(params)]
  }

  // @ts-ignore
  async patch(id: AdapterId, data: AgendaData, params?: ServiceParams): Promise<Agenda> {
    if (params?.query?.patchType === 'newEvent') {
      const newEventArray = data.appointments
      const prevAgenda = await this.agendaDelUsuario(params)

      return this.guardarCitas(prevAgenda, [
        ...prevAgenda.appointments,
        {
          id: newEventArray[0].id,
          startDate: newEventArray[0].startDate,
          endDate: newEventArray[0].endDate,
          patientId: newEventArray[0].patientId,
          patientName: newEventArray[0].patientName
        }
      ])
    } else if (params?.query?.patchType === 'eventUpdate') {
      const modEventArray = data.appointments
      const prevAgenda = await this.agendaDelUsuario(params)

      const listWithEventUpdated = prevAgenda.appointments.map((event) => {
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

      return this.guardarCitas(prevAgenda, listWithEventUpdated)
    } else if (params?.query?.patchType === 'deleteEvent') {
      const modEventArray = data.appointments
      const prevAgenda = await this.agendaDelUsuario(params)

      // Antes el filtro devolvía el evento en vez de un booleano y `undefined`
      // en la rama que sí coincidía. Funcionaba por casualidad —ambos valores
      // se leen como verdadero o falso— pero decía lo contrario de lo que hace.
      const listWithEventsUpdated = prevAgenda.appointments.filter(
        (event) => event.id !== modEventArray[0].id
      )

      return this.guardarCitas(prevAgenda, listWithEventsUpdated)
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
