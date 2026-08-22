import { HookContext } from '@feathersjs/feathers'

export const Add_User_To_Log = async (context: HookContext) => {
  context.data = {
    ...context.data,
    userId: `${context.params?.user?._id}`,
    ipAddress: `host:${context.params?.headers.host}, uagent: ${context.params?.headers['user-agent']}`
  }
  return context
}
