import { BadRequest } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

const objectIdDesdeFecha = (fecha: Date, borde: 'inicio' | 'fin') =>
  new ObjectId(
    Math.floor(fecha.getTime() / 1000)
      .toString(16)
      .padStart(8, '0') + (borde === 'inicio' ? '0000000000000000' : 'ffffffffffffffff')
  )

export const rangoDeObjectIds = (desde?: string, hasta?: string) => {
  if (desde && !/^\d{4}-\d{2}-\d{2}$/.test(desde)) throw new BadRequest('Fecha inicial inválida')
  if (hasta && !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) throw new BadRequest('Fecha final inválida')

  const inicio = desde ? new Date(`${desde}T00:00:00.000Z`) : undefined
  const fin = hasta ? new Date(`${hasta}T23:59:59.999Z`) : undefined
  if (inicio && Number.isNaN(inicio.getTime())) throw new BadRequest('Fecha inicial inválida')
  if (fin && Number.isNaN(fin.getTime())) throw new BadRequest('Fecha final inválida')
  if (inicio && fin && inicio > fin) throw new BadRequest('La fecha inicial debe ser anterior a la final')
  if (!inicio && !fin) return {}

  return {
    _id: {
      ...(inicio ? { $gte: objectIdDesdeFecha(inicio, 'inicio') } : {}),
      ...(fin ? { $lte: objectIdDesdeFecha(fin, 'fin') } : {})
    }
  }
}

export const fechaDeObjectId = (id: unknown): Date | undefined => {
  if (!ObjectId.isValid(String(id))) return undefined
  return new ObjectId(String(id)).getTimestamp()
}

export const formatearFecha = (fecha: Date): string => {
  const dia = String(fecha.getUTCDate()).padStart(2, '0')
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${fecha.getUTCFullYear()}`
}

export const calcularEdad = (birthDate: string | undefined, fecha: Date): number | null => {
  if (!birthDate) return null
  const iso = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const local = birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  const [anio, mes, dia] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : local
      ? [Number(local[3]), Number(local[2]), Number(local[1])]
      : [NaN, NaN, NaN]
  if (![anio, mes, dia].every(Number.isFinite)) return null

  let edad = fecha.getUTCFullYear() - anio
  if (fecha.getUTCMonth() + 1 < mes || (fecha.getUTCMonth() + 1 === mes && fecha.getUTCDate() < dia)) {
    edad--
  }
  return edad >= 0 ? edad : null
}
