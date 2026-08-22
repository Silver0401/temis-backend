// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  NoAuthTemplate,
  NoAuthTemplateData,
  NoAuthTemplatePatch,
  NoAuthTemplateQuery
} from './no-auth-template.schema'

export type { NoAuthTemplate, NoAuthTemplateData, NoAuthTemplatePatch, NoAuthTemplateQuery }

export interface NoAuthTemplateParams extends MongoDBAdapterParams<NoAuthTemplateQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class NoAuthTemplateService<
  ServiceParams extends Params = NoAuthTemplateParams
> extends MongoDBService<NoAuthTemplate, NoAuthTemplateData, NoAuthTemplateParams, NoAuthTemplatePatch> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('no-auth-template'))
  }
}
