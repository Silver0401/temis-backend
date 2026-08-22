// Canje PÚBLICO de un link de expediente compartido.
// Valida token + contraseña + identidad del consultante (sesión JWT o verificación
// NUFI) y devuelve SOLO ese expediente en modo lectura, ensamblado en el servidor.
//
// SEGURIDAD: nunca emite el JWT de sesión completo (ese fue el bug del QR). El acceso
// se limita al `patientId` del link: se responde con los datos de ese paciente y nada
// más. La contraseña siempre viaja/valida hasheada y el link expira / limita intentos.
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import { NotAuthenticated, NotFound, Forbidden } from '@feathersjs/errors'

import type { Application } from '../../declarations'
import type { RecordShareDoc } from '../record-share/record-share.class'
import { SHARE_MAX_ATTEMPTS } from '../record-share/record-share.class'
import { verifySharePassword } from '../../utils/share-password'

export interface RecordRedeemData {
  token: string
  password: string
  // Identidad: una de las dos.
  accessToken?: string // sesión iniciada
  nufiData?: any // verificación INE + rostro (flujo NUFI existente)
}

export interface RecordRedeemResult {
  patient: any
  // Expediente completo en lectura, ensamblado en el servidor para no disparar
  // los endpoints clínicos scopeados por CLUES desde el cliente compartido.
  bundle: {
    somas: any[]
    labs: any[]
    drugs: any[]
    imgs: any[]
    orders: any[]
  }
}

export interface RecordRedeemServiceOptions {
  app: Application
}

export interface RecordRedeemParams extends Params {}

export class RecordRedeemService<ServiceParams extends RecordRedeemParams = RecordRedeemParams>
  implements ServiceInterface<RecordRedeemResult, RecordRedeemData, ServiceParams>
{
  constructor(public options: RecordRedeemServiceOptions) {}

  private async collection() {
    const db = await this.options.app.get('mongodbClient')
    return db.collection<RecordShareDoc>('record_shares')
  }

  // Verifica que el consultante probó su identidad: sesión JWT válida O NUFI aprobado.
  private async assertIdentity(data: RecordRedeemData): Promise<void> {
    if (data.accessToken) {
      // Lanza NotAuthenticated si el token no es válido.
      await this.options.app.service('authentication').create({
        strategy: 'jwt',
        accessToken: data.accessToken
      } as any)
      return
    }
    if (data.nufiData) {
      // Reusa el flujo NUFI existente; lanza si la verificación falla.
      await this.options.app.service('verify-nufi').create(data.nufiData, { provider: undefined } as any)
      return
    }
    throw new NotAuthenticated('Debes iniciar sesión o verificar tu identidad')
  }

  async create(data: RecordRedeemData, _params?: ServiceParams): Promise<RecordRedeemResult> {
    if (!data?.token || !data?.password) {
      throw new Forbidden('token y contraseña son requeridos')
    }

    const col = await this.collection()
    const share = await col.findOne({ token: data.token })

    if (!share) throw new NotFound('Link inválido o expirado')
    if (share.expiresAt < Date.now()) throw new NotFound('Link inválido o expirado')
    if (share.attempts >= SHARE_MAX_ATTEMPTS) {
      throw new Forbidden('Link bloqueado por demasiados intentos')
    }

    if (!verifySharePassword(data.password, share.passwordHash)) {
      await col.updateOne({ _id: share._id }, { $inc: { attempts: 1 } })
      throw new Forbidden('Contraseña incorrecta')
    }

    // Solo tras validar la contraseña se comprueba la identidad, y solo entonces
    // se entregan datos del paciente.
    await this.assertIdentity(data)

    const app = this.options.app
    const pid = String(share.patientId)

    const patientRes: any = await app
      .service('patients')
      .get(pid, { provider: undefined } as any)
    const patient = patientRes?.data?.patientsList?.[0]
    if (!patient) throw new NotFound('No se encontró el expediente')

    // Todos los recursos hijos del paciente (provider undefined = sin scope CLUES),
    // para que la vista compartida los muestre sin llamar a los endpoints scopeados.
    const [somas, labs, drugs, imgs, orders] = await Promise.all([
      app.service('somas').get(pid, { provider: undefined } as any),
      app.service('labs').get(pid, { provider: undefined } as any),
      app.service('drugs').get(pid, { provider: undefined } as any),
      app.service('imgs').get(pid, { provider: undefined } as any),
      app.service('orders').get(pid, { provider: undefined } as any)
    ])

    return {
      patient,
      bundle: {
        somas: somas as any[],
        labs: labs as any[],
        drugs: drugs as any[],
        imgs: imgs as any[],
        orders: orders as any[]
      }
    }
  }

  async find(_params?: ServiceParams): Promise<RecordRedeemResult[]> {
    return []
  }
  async get(_id: Id, _params?: ServiceParams): Promise<RecordRedeemResult> {
    throw new NotFound()
  }
  async remove(_id: NullableId, _params?: ServiceParams): Promise<RecordRedeemResult> {
    throw new NotFound()
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
