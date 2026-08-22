import type { Id, Params } from '@feathersjs/feathers'
import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

import type { Application } from '../../declarations'
import {
  calculateConsentDocHash,
  getConsentTemplate,
  type ConsentTemplate
} from '../../json/ConsentTemplates'
import { generateShareToken } from '../../utils/share-password'
import type { Consent, ConsentData, ConsentQuery } from './consents.schema'

export const CONSENT_TTL_MS = 72 * 60 * 60 * 1000

export type ConsentDocument = Omit<Consent, '_id' | 'creatorId' | 'patientId'> & {
  _id?: ObjectId
  creatorId: ObjectId
  patientId?: ObjectId
}

export type ConsentView = ConsentDocument & {
  title: string
  body: string
  doctorName: string
}

export interface ConsentsParams extends Params<ConsentQuery> {}
export interface ConsentsServiceOptions {
  app: Application
}

const normalizeClues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((clues): clues is string => typeof clues === 'string' && clues.trim().length > 0)
  }
  return typeof value === 'string' && value.trim().length > 0 ? [value] : []
}

const cluesIntersect = (a: unknown, b: unknown): boolean => {
  const left = new Set(normalizeClues(a))
  return normalizeClues(b).some((clues) => left.has(clues))
}

const patientFullName = (patient: any): string | undefined => {
  const info = patient?.personalInfo
  const value = [info?.names, info?.middleName, info?.lastName].filter(Boolean).join(' ').trim()
  return value || undefined
}

export class ConsentsService<ServiceParams extends ConsentsParams = ConsentsParams> {
  constructor(public options: ConsentsServiceOptions) {}

  private async collection() {
    const db = await this.options.app.get('mongodbClient')
    return db.collection<ConsentDocument>('consents')
  }

  private async doctorName(creatorId: ObjectId): Promise<string> {
    const db = await this.options.app.get('mongodbClient')
    const doctor = await db
      .collection<{ _id: ObjectId; name?: string }>('users')
      .findOne({ _id: creatorId }, { projection: { name: 1 } })
    return doctor?.name?.trim() || 'Profesional de la salud'
  }

  private view(doc: ConsentDocument, template: ConsentTemplate, doctorName: string): ConsentView {
    return { ...doc, title: template.title, body: template.body, doctorName }
  }

  async create(data: ConsentData, params?: ServiceParams): Promise<ConsentView> {
    const user = params?.user
    if (!user?._id) throw new Forbidden('Sesión requerida para emitir un consentimiento')

    const template = getConsentTemplate(data.templateId)
    if (!template) throw new BadRequest('Plantilla de consentimiento inválida')

    let patientId: ObjectId | undefined
    let resolvedPatientName = data.patientName?.trim() || undefined

    if (data.patientId) {
      const patientResponse: any = await this.options.app
        .service('patients')
        .get(data.patientId, { provider: undefined, query: { skipRecords: true } } as any)
      const patient = patientResponse?.data?.patientsList?.[0]
      if (!patient || !cluesIntersect(user.clues, patient.clues)) {
        throw new NotFound('No se encontró el expediente')
      }
      patientId = new ObjectId(data.patientId)
      resolvedPatientName ||= patientFullName(patient)
    }

    const now = Date.now()
    const doc: ConsentDocument = {
      token: generateShareToken(),
      creatorId: new ObjectId(String(user._id)),
      templateId: template.templateId,
      docVersion: template.docVersion,
      docHash: calculateConsentDocHash(template.body),
      ...(patientId ? { patientId } : {}),
      ...(resolvedPatientName ? { patientName: resolvedPatientName } : {}),
      status: 'pending',
      createdAt: now,
      expiresAt: now + CONSENT_TTL_MS
    }

    const result = await (await this.collection()).insertOne(doc)
    doc._id = result.insertedId

    return this.view(doc, template, user.name?.trim() || (await this.doctorName(doc.creatorId)))
  }

  async find(params?: ServiceParams): Promise<ConsentView[]> {
    const user = params?.user
    if (!user?._id) throw new Forbidden('Sesión requerida para consultar consentimientos')

    const creatorId = new ObjectId(String(user._id))
    const query = params?.query ?? {}
    const filter: Record<string, unknown> = { creatorId }
    if (query.patientId) filter.patientId = new ObjectId(query.patientId)
    if (query.status) filter.status = query.status

    const docs = await (await this.collection()).find(filter).sort({ createdAt: -1 }).toArray()
    const doctorName = user.name?.trim() || (await this.doctorName(creatorId))

    return docs.flatMap((doc) => {
      const template = getConsentTemplate(doc.templateId)
      if (!template || calculateConsentDocHash(template.body) !== doc.docHash) return []
      return [this.view(doc, template, doctorName)]
    })
  }

  // Puente para el adaptador frontend actual, que aún no modela `find`.
  async get(id: Id, params?: ServiceParams): Promise<ConsentView[]> {
    if (id !== 'list') throw new NotFound()
    return this.find(params)
  }
}

export const getOptions = (app: Application): ConsentsServiceOptions => ({ app })
