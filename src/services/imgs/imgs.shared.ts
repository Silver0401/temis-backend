// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Imgs, ImgsData, ImgsPatch, ImgsQuery, ImgsService } from './imgs.class'

export type { Imgs, ImgsData, ImgsPatch, ImgsQuery }

export type ImgsClientService = Pick<ImgsService<Params<ImgsQuery>>, (typeof imgsMethods)[number]>

export const imgsPath = 'imgs'

export const imgsMethods: Array<keyof ImgsService> = ['find', 'get', 'create', 'patch', 'remove']

export const imgsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(imgsPath, connection.service(imgsPath), {
    methods: imgsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [imgsPath]: ImgsClientService
  }
}
