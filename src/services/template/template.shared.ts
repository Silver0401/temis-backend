// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Template, TemplateData, TemplatePatch, TemplateQuery, TemplateService } from './template.class'

export type { Template, TemplateData, TemplatePatch, TemplateQuery }

export type TemplateClientService = Pick<
  TemplateService<Params<TemplateQuery>>,
  (typeof templateMethods)[number]
>

export const templatePath = 'template'

export const templateMethods: Array<keyof TemplateService> = ['find', 'get', 'create', 'patch', 'remove']

export const templateClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(templatePath, connection.service(templatePath), {
    methods: templateMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [templatePath]: TemplateClientService
  }
}
