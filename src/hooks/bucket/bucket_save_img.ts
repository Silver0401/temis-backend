import { GeneralError } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.NOT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NOT_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NOT_AWS_SECRET_ACCESS_KEY!
  }
})

export const bucket_save_img = async (context: HookContext) => {
  console.log(context.params._rawImageBase64.slice(0, 100))

  function parseBase64(base64String: string) {
    if (!base64String) {
      throw new GeneralError('No se subió ninguna imágen')
    }
    const extractedB64File = base64String.split('base64,')[1]
    const extractedType = base64String.split('base64,')[0]

    const buffer = Buffer.from(extractedB64File, 'base64')
    return { buffer, extractedType }
  }

  const { buffer, extractedType } = parseBase64(context.params._rawImageBase64)

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.NOT_AWS_S3_BUCKET_NAME!,
      Key: context.result._id.toString(),
      Body: buffer,
      ContentType: extractedType
    })
  )

  return context
}
