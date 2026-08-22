// Servicio para EMITIR un link de expediente compartido.
// El médico creador (con acceso CLUES al paciente) genera un token + contraseña.
// La contraseña se guarda hasheada; el token se devuelve para armar la URL.
// El canje del link vive en el servicio `record-redeem` (público, rate-limited).
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import { Forbidden, NotFound } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

import type { Application } from '../../declarations'
import { cluesIntersect, normalizeClues } from '../../hooks/generic/scope-by-clues'
import { generateShareToken, hashSharePassword } from '../../utils/share-password'

// Vida del link: 48h.
export const SHARE_TTL_MS = 48 * 60 * 60 * 1000
// Máximo de intentos de contraseña antes de invalidar el link.
export const SHARE_MAX_ATTEMPTS = 10

export interface RecordShareDoc {
  _id?: ObjectId
  patientId: ObjectId
  passwordHash: string
  token: string
  creatorId: ObjectId
  expiresAt: number
  attempts: number
}

export interface RecordShareData {
  patientId: string
  password: string
}

export interface RecordShareResult {
  token: string
  expiresAt: number
}

export interface RecordShareServiceOptions {
  app: Application
}

export interface RecordShareParams extends Params {}

export class RecordShareService<ServiceParams extends RecordShareParams = RecordShareParams>
  implements ServiceInterface<RecordShareResult, RecordShareData, ServiceParams>
{
  constructor(public options: RecordShareServiceOptions) {}

  private async collection() {
    const db = await this.options.app.get('mongodbClient')
    return db.collection<RecordShareDoc>('record_shares')
  }

  async create(data: RecordShareData, params?: ServiceParams): Promise<RecordShareResult> {
    const user = params?.user
    if (!user?._id) {
      throw new Forbidden('Sesión requerida para compartir un expediente')
    }
    if (!data?.patientId || !data?.password) {
      throw new Forbidden('patientId y contraseña son requeridos')
    }

    // El creador debe tener acceso CLUES al paciente (reusa el scope existente).
    const patientRes: any = await this.options.app
      .service('patients')
      .get(data.patientId, { provider: undefined, query: { skipRecords: true } } as any)
    const patient = patientRes?.data?.patientsList?.[0]
    if (!patient || !cluesIntersect(normalizeClues(user.clues), patient.clues)) {
      throw new NotFound('No se encontró el expediente')
    }

    const token = generateShareToken()
    const doc: RecordShareDoc = {
      patientId: new ObjectId(String(data.patientId)),
      passwordHash: hashSharePassword(data.password),
      token,
      creatorId: new ObjectId(String(user._id)),
      expiresAt: Date.now() + SHARE_TTL_MS,
      attempts: 0
    }

    const col = await this.collection()
    await col.insertOne(doc)

    return { token, expiresAt: doc.expiresAt }
  }

  // Métodos no usados (interface).
  async find(_params?: ServiceParams): Promise<RecordShareResult[]> {
    return []
  }
  async get(_id: Id, _params?: ServiceParams): Promise<RecordShareResult> {
    throw new NotFound()
  }
  async remove(_id: NullableId, _params?: ServiceParams): Promise<RecordShareResult> {
    throw new NotFound()
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
