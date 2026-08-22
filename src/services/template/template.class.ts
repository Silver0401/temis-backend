// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Template, TemplateData, TemplatePatch, TemplateQuery } from './template.schema'

export type { Template, TemplateData, TemplatePatch, TemplateQuery }

export interface TemplateServiceOptions {
  app: Application
}

export interface TemplateParams extends Params<TemplateQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class TemplateService<ServiceParams extends TemplateParams = TemplateParams>
  implements ServiceInterface<Template, TemplateData, ServiceParams, TemplatePatch>
{
  constructor(public options: TemplateServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Template[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Template> {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: TemplateData, params?: ServiceParams): Promise<Template>
  async create(data: TemplateData[], params?: ServiceParams): Promise<Template[]>
  async create(data: TemplateData | TemplateData[], params?: ServiceParams): Promise<Template | Template[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: TemplateData, _params?: ServiceParams): Promise<Template> {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id: NullableId, data: TemplatePatch, _params?: ServiceParams): Promise<Template> {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Template> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
