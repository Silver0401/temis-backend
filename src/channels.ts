// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { RealTimeConnection, Params } from '@feathersjs/feathers'
import type { AuthenticationResult } from '@feathersjs/authentication'
import '@feathersjs/transport-commons'
import type { Application, HookContext } from './declarations'
import { logger } from './logger'
import { GeneralError } from '@feathersjs/errors'

export const channels = (app: Application) => {
  logger.warn(
    'Publishing all events to all authenticated users. See `channels.ts` and https://dove.feathersjs.com/api/channels.html for more information.'
  )

  app.on('connection', (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    console.log('New Socket Connection with ID: ', connection.headers.sessionid)
    app.channel(`anonymous${connection.id}`).join(connection)
  })

  app.on('login', async (authResult: AuthenticationResult, { connection }: Params) => {
    if (connection) {
      const deviceType = connection.headers.devicetype as 'phone' | 'computer'
      const userId = connection.user._id
      const userStatus = connection.user.status
      const currentDevices = userStatus.devices as string[]

      if (!deviceType) {
        throw new GeneralError('Error 500: Device Type Connection not Allowed')
      }

      if (currentDevices.length >= 2) {
        throw new GeneralError('Error 500: Maximum Devices Connected')
      }

      // if (deviceType === 'computer') {
      if (currentDevices.includes(deviceType)) {
        throw new GeneralError(`Error: ${deviceType} device already connected`)
      }

      const updatedDevices = [...currentDevices, deviceType]

      await app.service('users').patch(userId, { status: { ...userStatus, devices: updatedDevices } })

      app.service('users').emit('devicesConnected', { devices: updatedDevices, userId: userId })

      console.log('Socket Login', `user/${userId}, deviceType: ${deviceType}`)
      app.channel(`user/${userId}`).join(connection)
    }
  })

  // app.on('logout', async (authResult: AuthenticationResult, { connection }: Params) => {

  // })

  // Publica cada evento SOLO en el canal del usuario dueño, no a todos los
  // autenticados (evita fuga de datos de un paciente/expediente a otros médicos).
  // Se prioriza el usuario que originó la operación; si el evento se emitió a mano
  // con { userId } en el payload, se usa ese. Sin dueño identificable no se publica.
  app.publish((data: any, context: HookContext) => {
    const ownerId = context?.params?.user?._id ?? data?.userId
    if (!ownerId) return []
    return app.channel(`user/${ownerId}`)
  })
}
