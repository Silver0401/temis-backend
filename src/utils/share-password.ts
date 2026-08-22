// Hashing de la contraseña de un link para compartir expediente.
// Usa scrypt de la stdlib de Node (sin dependencias). Formato almacenado:
// `<saltHex>:<hashHex>`. La verificación es en tiempo constante.
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LEN = 64

export const hashSharePassword = (password: string): string => {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LEN)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export const verifySharePassword = (password: string, stored: string): boolean => {
  const [saltHex, hashHex] = (stored ?? '').split(':')
  if (!saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), KEY_LEN)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

// Token aleatorio para armar la URL del link.
export const generateShareToken = (): string => randomBytes(24).toString('hex')
