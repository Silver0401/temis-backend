// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { OrdersService } from './orders.class'

// Main data model schema
export const ordersSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: ObjectIdSchema(),
    recordId: Type.Optional(ObjectIdSchema()),
    diagnosisId: Type.Optional(Type.String()),
    ordersArray: Type.Array(
      Type.Object({
        request: Type.String(),
        observations: Type.String()
      })
    )
  },
  { $id: 'Orders', additionalProperties: false }
)
export type Orders = Static<typeof ordersSchema>
export const ordersValidator = getValidator(ordersSchema, dataValidator)
export const ordersResolver = resolve<OrdersQuery, HookContext<OrdersService>>({})

export const ordersExternalResolver = resolve<Orders, HookContext<OrdersService>>({})

// Schema for creating new entries
export const ordersDataSchema = Type.Pick(
  ordersSchema,
  ['ordersArray', 'patientId', 'diagnosisId', 'recordId'],
  {
    $id: 'OrdersData'
  }
)
export type OrdersData = Static<typeof ordersDataSchema>
export const ordersDataValidator = getValidator(ordersDataSchema, dataValidator)
export const ordersDataResolver = resolve<OrdersData, HookContext<OrdersService>>({})

// Schema for updating existing entries
export const ordersPatchSchema = Type.Partial(ordersSchema, {
  $id: 'OrdersPatch'
})
export type OrdersPatch = Static<typeof ordersPatchSchema>
export const ordersPatchValidator = getValidator(ordersPatchSchema, dataValidator)
export const ordersPatchResolver = resolve<OrdersPatch, HookContext<OrdersService>>({})

// Schema for allowed query properties
export const ordersQueryProperties = Type.Pick(ordersSchema, [
  '_id',
  'patientId',
  'diagnosisId',
  'ordersArray'
])
export const ordersQuerySchema = Type.Intersect(
  [
    querySyntax(ordersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type OrdersQuery = Static<typeof ordersQuerySchema>
export const ordersQueryValidator = getValidator(ordersQuerySchema, queryValidator)
export const ordersQueryResolver = resolve<OrdersQuery, HookContext<OrdersService>>({})
