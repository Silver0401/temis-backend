import type { HookContext } from '../../declarations'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Imgs } from '../../client'

const s3 = new S3Client({
  region: process.env.NOT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NOT_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NOT_AWS_SECRET_ACCESS_KEY!
  }
})

export const populate_img_url = async (context: HookContext) => {
  const PopulatedImgs = await Promise.all(
    context.result.map(async (image: Imgs) => {
      const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: 'cronosmdbucket', Key: image._id.toString() }),
      { expiresIn: 60 * 15 } // 30 minutos
    )

      return {
        ...image,
        Image: url
      }
    })
  )

  context.result = PopulatedImgs

  return context
}
