// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import { GeneralError } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

export const update_user_groups = async (context: HookContext) => {
  try {
    const userId = context.params.user._id
    const userCurrentGroups = context.params.user.groups
    const groupId = context.result._id
    const groupName = context.result.name

    await context.app.service('users')._patch(userId, {
      groups: [
        ...userCurrentGroups,
        {
          id: groupId,
          name: groupName
        }
      ]
    })
  } catch (error) {
    throw new GeneralError(`${error}`)
  }
}
