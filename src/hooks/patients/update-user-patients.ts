// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../../declarations'

export const updateUserPatients = async (context: HookContext) => {
  const { app, result } = context

  const userId = context.arguments[1].user._id ? context.arguments[1].user._id : context.params.user._id
  const newPatientId = result._id

  const usersService = app.service('users')

  const user = await usersService.get(userId)

  await usersService.patch(userId, {
    patientsList: [...user.patientsList, newPatientId]
  })

  return context
}
