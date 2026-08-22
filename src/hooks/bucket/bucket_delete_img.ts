import type { HookContext } from '../../declarations'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.NOT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NOT_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NOT_AWS_SECRET_ACCESS_KEY!
  }
})

export const bucket_delete_img = async (context: HookContext) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.NOT_AWS_S3_BUCKET_NAME!,
      Key: context.id?.toString()
    })
  )

  return context
}
