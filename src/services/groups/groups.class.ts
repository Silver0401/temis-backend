// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions, AdapterId } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Groups, GroupsData, GroupsPatch, GroupsQuery } from './groups.schema'
import { GeneralError } from '@feathersjs/errors'
import { app } from '../../app'
import { ObjectId } from 'mongodb'

export type { Groups, GroupsData, GroupsPatch, GroupsQuery }

export interface GroupsParams extends MongoDBAdapterParams<GroupsQuery> {
  action?: 'add' | 'remove'
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class GroupsService<ServiceParams extends Params = GroupsParams> extends MongoDBService<
  Groups,
  GroupsData,
  GroupsParams,
  GroupsPatch
> {
  async get(_id: AdapterId, params: ServiceParams): Promise<Groups> {
    console.log(params.query)

    if (params.query?.getUserGroups) {
      // Obtener el ID del grupo desde los parámetros y Buscarlo
      const objectId = new ObjectId(_id)
      // @ts-ignore
      // console.log(objectId)
      const result = (await this.find({ query: { members: { $in: [objectId] } } })).data

      // console.log(result)
      // console.log(result)
      // @ts-ignore
      return result
    } else {
      // Obtener el ID del grupo desde los parámetros y Buscarlo
      const objectId = new ObjectId(_id)
      const result = (await this.find({ query: { _id: objectId } })).data[0]
      return result
    }
  }
  // @ts-ignore
  async patch(_id: AdapterId, data: GroupsPatch, params: GroupsParams): Promise<Groups | Groups[]> {
    const patientId = data.patients?.[0]
    // @ts-ignore
    const action = data.action
    console.log(action)

    if (action === 'add') {
      if (patientId) {
        console.log(`Patching group with id: ${_id}`)
        console.log(`Patient added: ${patientId}`)
        // @ts-ignore
        const prevGroupData = await this.get(_id, params)

        return super.patch(_id, { ...prevGroupData, patients: [...prevGroupData.patients, patientId] })
      } else {
        throw new GeneralError('No user Id retrieved')
      }
    }
    if (action === 'remove') {
      const patientId = data.patients?.[0]

      if (patientId) {
        console.log(`Patching group with id: ${_id}`)
        console.log(`Patient removed: ${patientId}`)
        // @ts-ignore
        const prevGroupData = await this.get(_id, params)
        const newGroup = prevGroupData.patients.filter((px) => px.toString() !== patientId.toString())

        return super.patch(_id, {
          ...prevGroupData,
          patients: newGroup
        })
      } else {
        throw new GeneralError('No user Id retrieved')
      }
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('groups'))
  }
}
