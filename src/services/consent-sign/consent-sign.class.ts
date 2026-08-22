import type { Id, Params } from '@feathersjs/feathers'
import { BadRequest, NotFound } from '@feathersjs/errors'
import type { ObjectId } from 'mongodb'

import type { Application } from '../../declarations'
import { calculateConsentDocHash, getConsentTemplate } from '../../json/ConsentTemplates'
import type { ConsentDocument } from '../consents/consents.class'
import type { ConsentSignData, ConsentSignGetResult, ConsentSignResult } from './consent-sign.schema'
import { MAX_SIGNATURE_BYTES } from './consent-sign.schema'

export interface ConsentSignParams extends Params {}
export interface ConsentSignServiceOptions {
  app: Application
}

const invalidLink = () => new NotFound('Link inválido o expirado')

export class ConsentSignService<ServiceParams extends ConsentSignParams = ConsentSignParams> {
  constructor(public options: ConsentSignServiceOptions) {}

  private async collection() {
    const db = await this.options.app.get('mongodbClient')
    return db.collection<ConsentDocument>('consents')
  }

  private async doctorName(creatorId: ObjectId): Promise<string | undefined> {
    const db = await this.options.app.get('mongodbClient')
    const doctor = await db
      .collection<{ _id: ObjectId; name?: string }>('users')
      .findOne({ _id: creatorId }, { projection: { name: 1 } })
    return doctor?.name?.trim() || undefined
  }

  private validTemplate(consent: ConsentDocument) {
    const template = getConsentTemplate(consent.templateId)
    if (
      !template ||
      template.docVersion !== consent.docVersion ||
      calculateConsentDocHash(template.body) !== consent.docHash
    ) {
      throw invalidLink()
    }
    return template
  }

  private validatePng(signatureImage: string): void {
    const encoded = signatureImage.slice('data:image/png;base64,'.length)
    const bytes = Buffer.from(encoded, 'base64')
    const pngMagic = bytes.subarray(0, 8).toString('hex')
    if (bytes.length > MAX_SIGNATURE_BYTES || pngMagic !== '89504e470d0a1a0a') {
      throw new BadRequest('La firma debe ser una imagen PNG válida de máximo 200 KB')
    }
  }

  private requestEvidence(params?: ServiceParams) {
    const forwarded = params?.headers?.['x-forwarded-for']
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
    const signerIp = String(
      forwardedIp || params?.headers?.['x-real-ip'] || (params as any)?.connection?.remoteAddress || 'unknown'
    ).trim()
    const userAgent = String(params?.headers?.['user-agent'] || 'unknown').slice(0, 1000)
    return { signerIp, userAgent }
  }

  async get(id: Id, _params?: ServiceParams): Promise<ConsentSignGetResult> {
    try {
      const consent = await (
        await this.collection()
      ).findOne({
        token: String(id),
        status: 'pending',
        expiresAt: { $gte: Date.now() }
      } as any)
      if (!consent) throw invalidLink()

      const template = this.validTemplate(consent)
      const doctorName = await this.doctorName(consent.creatorId)
      if (!doctorName) throw invalidLink()

      return {
        title: template.title,
        body: template.body,
        docVersion: consent.docVersion,
        docHash: consent.docHash,
        doctorName,
        ...(consent.patientName ? { patientName: consent.patientName } : {})
      }
    } catch {
      throw invalidLink()
    }
  }

  async create(data: ConsentSignData, params?: ServiceParams): Promise<ConsentSignResult> {
    const signerName = data.signerName.trim()
    if (signerName.length < 2) throw new BadRequest('El nombre de quien firma es requerido')
    if (data.mode === 'canvas') this.validatePng(data.signatureImage)

    const collection = await this.collection()
    const consent = await collection.findOne({
      token: data.token,
      status: 'pending',
      expiresAt: { $gte: Date.now() }
    } as any)
    if (!consent) throw invalidLink()
    this.validTemplate(consent)

    const signedAt = Date.now()
    const { signerIp, userAgent } = this.requestEvidence(params)
    const signed = await collection.findOneAndUpdate(
      {
        _id: consent._id,
        token: data.token,
        status: 'pending',
        expiresAt: { $gte: signedAt }
      } as any,
      {
        $set: {
          status: 'signed',
          signatureMode: data.mode,
          ...(data.mode === 'canvas' ? { signatureImage: data.signatureImage } : {}),
          signerName,
          signedAt,
          signerIp,
          userAgent
        }
      },
      { returnDocument: 'after' }
    )
    if (!signed) throw invalidLink()

    try {
      await this.options.app.service('logs').create(
        {
          ...(consent.patientId ? { patientId: consent.patientId } : {}),
          action: `consent_signed:${signerName}`,
          timestamp: new Date(signedAt).toISOString(),
          resourceType: 'consent',
          resourceId: String(consent._id),
          status: 'success',
          sessionRef: consent.docHash
        } as any,
        {
          provider: undefined,
          user: { _id: consent.creatorId },
          headers: { host: signerIp, 'user-agent': userAgent }
        } as any
      )
    } catch {
      await collection.updateOne({ _id: consent._id, status: 'signed', signedAt } as any, {
        $set: { status: 'pending' },
        $unset: {
          signatureMode: '',
          signatureImage: '',
          signerName: '',
          signedAt: '',
          signerIp: '',
          userAgent: ''
        }
      })
      throw invalidLink()
    }

    return { status: 'signed', signedAt }
  }
}

export const getOptions = (app: Application): ConsentSignServiceOptions => ({ app })
