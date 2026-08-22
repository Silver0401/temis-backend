import type { HookContext } from '../../declarations'

export const remove_img_temporally = async (context: HookContext) => {
  context.params._rawImageBase64 = context.data.Image

  if (context.data.Image !== undefined) {
    delete context.data.Image
  }

  return context
}
