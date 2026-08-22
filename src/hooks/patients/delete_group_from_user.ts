// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../../declarations'

export const delete_group_from_user = async (context: HookContext) => {
  const { app } = context

  //  -------------- Find And Delete all Records associated with the deleted Patient -----------------------

  try {
    const groups = context.params.user.groups
    const filteredGroups = groups.filter((groupId: any) => {
      return groupId.id.toString() !== context.id?.toString()
    })

    await app.service('users').patch(context.params.user._id, {
      groups: filteredGroups
    })
  } catch (error) {
    console.error(` ${context.id}`, error)
  }

  return context
}
