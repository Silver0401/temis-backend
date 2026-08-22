import { BadRequest, Forbidden } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import { ObjectId } from 'mongodb'

import type { Application } from '../../declarations'

export interface AdminConsoleParams extends Params {}
export interface AdminConsoleServiceOptions {
  app: Application
}

type AdminSection = 'doctors' | 'patients' | 'stats' | 'agendas'

const SECTIONS: AdminSection[] = ['doctors', 'patients', 'stats', 'agendas']
const MAX_LIMIT = 100

// Mismo criterio que hooks/generic/scope-by-clues.ts: el valor puede venir del
// buscador de establecimientos como "CLUES - Nombre Unidad".
const normalizeClues = (clues: string) =>
  clues
    .trim()
    .split(/\s+-\s+/, 1)[0]
    .toUpperCase()

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Los documentos no guardan fecha de alta: se deriva del ObjectId, cuyos
// primeros 4 bytes son el timestamp en segundos.
const objectIdFrom = (date: Date, edge: 'start' | 'end') =>
  new ObjectId(
    Math.floor(date.getTime() / 1000)
      .toString(16)
      .padStart(8, '0') + (edge === 'start' ? '0000000000000000' : 'ffffffffffffffff')
  )

const parseDate = (value: unknown, edge: 'start' | 'end') => {
  if (!value) return undefined
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) throw new BadRequest('Fecha inválida')
  return objectIdFrom(date, edge)
}

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/**
 * Consola del administrador de plataforma.
 *
 * Es un servicio aparte a propósito: `scope-by-role-and-tutor` le prohíbe al rol
 * `admin` tocar los servicios clínicos, y este perfil necesita ver a través de
 * todos los establecimientos. Es decir, **cruza el aislamiento por CLUES**; su
 * única defensa es la comprobación de rol de `requireAdmin`.
 */
export class AdminConsoleService {
  constructor(public options: AdminConsoleServiceOptions) {}

  private requireAdmin(params?: AdminConsoleParams) {
    if (params?.user?.role !== 'admin') {
      throw new Forbidden('Esta sección es exclusiva de la administración de plataforma')
    }
  }

  private db() {
    return this.options.app.get('mongodbClient')
  }

  // Se expone como `get` y no como `find` porque el cliente del frontend
  // (`feathersFetchCC`) solo sabe hablar get/create/patch/remove. El primer
  // argumento se ignora; los filtros viajan en `params.query`.
  async get(_id: unknown, params?: AdminConsoleParams): Promise<any> {
    this.requireAdmin(params)
    const query = (params?.query ?? {}) as Record<string, unknown>
    const section = String(query.section ?? 'patients') as AdminSection
    if (!SECTIONS.includes(section)) throw new BadRequest('Sección desconocida')

    if (section === 'doctors') return this.doctors()
    if (section === 'patients') return this.patients(query)
    if (section === 'agendas') return this.agendas(query)
    return this.stats(query)
  }

  /** Catálogo para los selectores: médicos activos con sus CLUES. */
  private async doctors() {
    const db = await this.db()
    const doctors = await db
      .collection('users')
      .find(
        { $or: [{ role: 'medico' }, { role: { $exists: false } }] },
        { projection: { name: 1, email: 1, clues: 1, patientsList: 1 } }
      )
      .sort({ name: 1 })
      .toArray()

    return doctors.map((doctor: any) => ({
      _id: String(doctor._id),
      name: doctor.name,
      email: doctor.email,
      clues: Array.isArray(doctor.clues) ? doctor.clues : doctor.clues ? [doctor.clues] : [],
      patientsCount: (doctor.patientsList ?? []).length
    }))
  }

  /**
   * La relación médico→paciente vive en `users.patientsList`, no en el paciente,
   * así que filtrar por médico se resuelve leyendo su lista. Un paciente que no
   * esté en la lista de ningún médico no aparece bajo ese filtro, pero sí bajo
   * el de CLUES.
   */
  private async patientIdsOfDoctor(doctorId: string) {
    const db = await this.db()
    if (!ObjectId.isValid(doctorId)) throw new BadRequest('Médico inválido')
    const doctor = await db
      .collection('users')
      .findOne({ _id: new ObjectId(doctorId) }, { projection: { patientsList: 1 } })
    return (doctor?.patientsList ?? []).map((patientId: any) => new ObjectId(String(patientId)))
  }

  private async patientFilter(query: Record<string, unknown>) {
    const filter: Record<string, any> = {}

    const q = String(query.q ?? '').trim()
    if (q) {
      const regex = { $regex: escapeRegex(q), $options: 'i' }
      filter.$or = [
        { 'personalInfo.names': regex },
        { 'personalInfo.middleName': regex },
        { 'personalInfo.lastName': regex },
        // El buscador de `patients` no contempla CURP; aquí sí, es el dato con
        // el que la administración identifica a una persona sin ambigüedad.
        { 'personalInfo.curp': regex }
      ]
    }

    const sex = String(query.sex ?? '').trim()
    if (sex) filter['personalInfo.sex'] = sex

    const clues = String(query.clues ?? '').trim()
    if (clues) filter.clues = normalizeClues(clues)

    const from = parseDate(query.from, 'start')
    const to = parseDate(query.to, 'end')
    if (from || to) {
      filter._id = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) }
    }

    const doctorId = String(query.doctorId ?? '').trim()
    if (doctorId) {
      const ids = await this.patientIdsOfDoctor(doctorId)
      filter._id = { ...(filter._id ?? {}), $in: ids }
    }

    return filter
  }

  private async patients(query: Record<string, unknown>) {
    const db = await this.db()
    const filter = await this.patientFilter(query)
    const limit = Math.min(toNumber(query.$limit, 25), MAX_LIMIT)
    const skip = toNumber(query.$skip, 0)

    const collection = db.collection('patients')
    const [total, rows] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .find(filter, { projection: { personalInfo: 1, clues: 1, LUID: 1 } })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ])

    // El dueño se resuelve al revés: se busca en qué lista de médico cae cada id.
    const owners = await db
      .collection('users')
      .find(
        {
          patientsList: {
            $in: [...rows.map((row: any) => row._id), ...rows.map((row: any) => String(row._id))]
          }
        },
        { projection: { name: 1, patientsList: 1 } }
      )
      .toArray()
    const ownerByPatient = new Map<string, string>()
    owners.forEach((owner: any) => {
      ;(owner.patientsList ?? []).forEach((patientId: any) => {
        if (!ownerByPatient.has(String(patientId))) ownerByPatient.set(String(patientId), owner.name)
      })
    })

    return {
      total,
      limit,
      skip,
      data: rows.map((row: any) => ({
        _id: String(row._id),
        LUID: row.LUID,
        names: row.personalInfo?.names ?? '',
        middleName: row.personalInfo?.middleName ?? '',
        lastName: row.personalInfo?.lastName ?? '',
        curp: row.personalInfo?.curp ?? '',
        sex: row.personalInfo?.sex ?? '',
        birthDate: row.personalInfo?.birthDate ?? '',
        clues: Array.isArray(row.clues) ? row.clues : row.clues ? [row.clues] : [],
        registeredAt: row._id.getTimestamp(),
        doctorName: ownerByPatient.get(String(row._id)) ?? null
      }))
    }
  }

  /**
   * Pacientes alcanzables con los filtros de establecimiento y de médico.
   * `null` significa "sin acotar": no se filtra por paciente en absoluto.
   */
  private async scopePatientIds(query: Record<string, unknown>): Promise<ObjectId[] | null> {
    const db = await this.db()
    const clues = String(query.clues ?? '').trim()
    const doctorId = String(query.doctorId ?? '').trim()
    if (!clues && !doctorId) return null

    const conjuntos: ObjectId[][] = []

    if (clues) {
      const filas = await db
        .collection('patients')
        .find({ clues: normalizeClues(clues) }, { projection: { _id: 1 } })
        .toArray()
      conjuntos.push(filas.map((fila: any) => fila._id))
    }

    if (doctorId) conjuntos.push(await this.patientIdsOfDoctor(doctorId))

    // Con los dos filtros puestos, la intersección: pacientes de ese médico
    // dentro de ese establecimiento.
    const [primero, ...resto] = conjuntos
    const interseccion = resto.reduce((acc, lista) => {
      const claves = new Set(lista.map(String))
      return acc.filter((id) => claves.has(String(id)))
    }, primero)

    return interseccion
  }

  /** Rango de `_id` que cubre un intervalo de fechas. */
  private rangoDeIds(desde?: Date, hasta?: Date) {
    if (!desde && !hasta) return {}
    return {
      _id: {
        ...(desde ? { $gte: objectIdFrom(desde, 'start') } : {}),
        ...(hasta ? { $lte: objectIdFrom(hasta, 'end') } : {})
      }
    }
  }

  /**
   * Resumen del tablero de administración.
   *
   * La entidad principal es la CONSULTA, no el paciente: "consultas de agosto"
   * son los registros creados en agosto, aunque el paciente se haya dado de alta
   * en julio. Antes esto filtraba pacientes por fecha de alta y contaba sus
   * registros, que responde otra pregunta.
   *
   * La serie anual ignora a propósito el mes seleccionado —es la comparación
   * contra el resto del año— pero sí respeta establecimiento y médico.
   */
  private async stats(query: Record<string, unknown>) {
    const db = await this.db()

    const desde = query.from ? new Date(String(query.from)) : undefined
    const hasta = query.to ? new Date(String(query.to)) : undefined
    if ((desde && isNaN(desde.getTime())) || (hasta && isNaN(hasta.getTime()))) {
      throw new BadRequest('Fecha inválida')
    }

    const patientIds = await this.scopePatientIds(query)
    const alcance = patientIds ? { patientId: { $in: [...patientIds, ...patientIds.map(String)] } } : {}

    const enRango = { ...alcance, ...this.rangoDeIds(desde, hasta) }

    const [records, drugs, ordersCount, somasCount, pacientesAlcance] = await Promise.all([
      db
        .collection('records')
        .find(enRango, { projection: { Diagnosis: 1 } })
        .toArray(),
      db
        .collection('drugs')
        .find(enRango, { projection: { values: 1 } })
        .toArray(),
      db.collection('orders').countDocuments(enRango),
      db.collection('somas').countDocuments(enRango),
      patientIds ? patientIds.length : db.collection('patients').countDocuments({})
    ])

    // Fármacos recetados: un renglón por medicamento dentro de cada receta.
    const porFarmaco = new Map<string, number>()
    let recetados = 0
    drugs.forEach((receta: any) => {
      ;(receta.values ?? []).forEach((item: any) => {
        const nombre = String(item?.name ?? '').trim()
        if (!nombre) return
        porFarmaco.set(nombre, (porFarmaco.get(nombre) ?? 0) + 1)
        recetados += 1
      })
    })

    // Diagnósticos: se agrupan por clave CIE, que es lo estable; el nombre solo
    // acompaña para mostrarlo.
    const porDiagnostico = new Map<string, { name: string; count: number }>()
    records.forEach((record: any) => {
      ;(record.Diagnosis ?? []).forEach((dx: any) => {
        const clave = String(dx?.CIE ?? dx?.id ?? '').trim()
        if (!clave) return
        const actual = porDiagnostico.get(clave)
        porDiagnostico.set(clave, {
          name: actual?.name ?? String(dx?.Name ?? clave),
          count: (actual?.count ?? 0) + 1
        })
      })
    })

    // Serie del año completo al que pertenece el mes seleccionado.
    const anio = (desde ?? new Date()).getFullYear()
    const delAnio = await db
      .collection('records')
      .find(
        { ...alcance, ...this.rangoDeIds(new Date(anio, 0, 1), new Date(anio, 11, 31, 23, 59, 59)) },
        { projection: { _id: 1 } }
      )
      .toArray()

    const porMes = new Array(12).fill(0)
    delAnio.forEach((record: any) => {
      porMes[(record._id.getTimestamp() as Date).getMonth()] += 1
    })

    // Mes anterior, para la comparación de la cifra guía. Un número solo no
    // dice nada; con su referencia sí.
    let previo: number | null = null
    if (desde) {
      const iniPrevio = new Date(desde.getFullYear(), desde.getMonth() - 1, 1)
      const finPrevio = new Date(desde.getFullYear(), desde.getMonth(), 0, 23, 59, 59)
      previo = await db
        .collection('records')
        .countDocuments({ ...alcance, ...this.rangoDeIds(iniPrevio, finPrevio) })
    }

    return {
      anio,
      previousMonthConsultas: previo,
      totals: {
        consultas: records.length,
        pacientes: pacientesAlcance,
        recetas: drugs.length,
        farmacosRecetados: recetados,
        solicitudes: ordersCount,
        somatometrias: somasCount
      },
      drugs: [...porFarmaco.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      diagnoses: [...porDiagnostico.entries()]
        .map(([cie, info]) => ({ cie, name: info.name, count: info.count }))
        .sort((a, b) => b.count - a.count),
      months: porMes.map((count, index) => ({ month: index + 1, count }))
    }
  }

  /**
   * Las agendas se guardan como un documento por médico y **no llevan CLUES**,
   * así que filtrar por establecimiento obliga a resolver el dueño en `users`.
   */
  private async agendas(query: Record<string, unknown>) {
    const db = await this.db()
    const doctorId = String(query.doctorId ?? '').trim()
    const clues = String(query.clues ?? '').trim()

    const ownerFilter: Record<string, any> = {}
    if (doctorId) {
      if (!ObjectId.isValid(doctorId)) throw new BadRequest('Médico inválido')
      ownerFilter._id = new ObjectId(doctorId)
    }

    const allOwners = await db
      .collection('users')
      .find(ownerFilter, { projection: { name: 1, clues: 1 } })
      .toArray()

    // A diferencia de `patients.clues`, que el resolver guarda ya normalizado,
    // `users.clues` conserva lo que mandó el registro y puede venir como
    // "CLUES - Nombre Unidad". Por eso se compara normalizando en memoria.
    const wanted = clues ? normalizeClues(clues) : ''
    const owners = wanted
      ? allOwners.filter((owner: any) => {
          const list = Array.isArray(owner.clues) ? owner.clues : owner.clues ? [owner.clues] : []
          return list.some((value: string) => normalizeClues(value) === wanted)
        })
      : allOwners
    const ownerById = new Map(owners.map((owner: any) => [String(owner._id), owner]))

    const ownerIds = owners.map((owner: any) => owner._id)
    const agendas = await db
      .collection('agenda')
      .find({ userId: { $in: [...ownerIds, ...ownerIds.map(String)] } })
      .toArray()

    const from = query.from ? new Date(String(query.from)) : undefined
    const to = query.to ? new Date(String(query.to)) : undefined

    const appointments = agendas.flatMap((agenda: any) => {
      const owner: any = ownerById.get(String(agenda.userId))
      return (agenda.appointments ?? [])
        .filter((appointment: any) => {
          const start = new Date(appointment.startDate)
          if (Number.isNaN(start.getTime())) return true
          if (from && start < from) return false
          if (to && start > to) return false
          return true
        })
        .map((appointment: any) => ({
          id: appointment.id,
          patientId: String(appointment.patientId ?? ''),
          patientName: appointment.patientName,
          startDate: appointment.startDate,
          endDate: appointment.endDate,
          doctorId: String(agenda.userId),
          doctorName: owner?.name ?? 'Sin nombre',
          clues: Array.isArray(owner?.clues) ? owner.clues : owner?.clues ? [owner.clues] : []
        }))
    })

    appointments.sort((a: any, b: any) => String(a.startDate).localeCompare(String(b.startDate)))

    // Los médicos que aparecen en el resultado: el calendario los usa para la
    // leyenda y para asignar un color estable por dueño.
    const conAgenda = [...new Set(appointments.map((a: any) => a.doctorId))].map((id) => {
      const owner: any = ownerById.get(String(id))
      return { _id: String(id), name: owner?.name ?? 'Sin nombre' }
    })

    return { total: appointments.length, doctors: conAgenda, data: appointments }
  }
}

export const getOptions = (app: Application): AdminConsoleServiceOptions => ({ app })
