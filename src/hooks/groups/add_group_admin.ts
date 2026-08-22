// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext } from '../../declarations'

export const add_group_admin = async (context: HookContext) => {
  const userId = context.params.user._id

  context.data = {
    ...context.data,
    members: [userId]
  }
}
