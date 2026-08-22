import { GeneralError } from '@feathersjs/errors'

const CURP_GENERICA = 'XXXX999999XXXXXX99'

// Regex based on RENAPO Instructivo Normativo para la Asignación de la CURP
// Structure: 4 letters (apellidos+nombre) | 6 digits (YYMMDD) | 1 sex char | 2-char state | 3 consonants | 1 alphanum | 1 check digit
const CURP_REGEX =
  /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HMX](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/

function calcularDigitoVerificador(curp17: string): number {
  const diccionario = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
  let suma = 0
  for (let i = 0; i < 17; i++) {
    suma += diccionario.indexOf(curp17.charAt(i)) * (18 - i)
  }
  const digito = 10 - (suma % 10)
  return digito === 10 ? 0 : digito
}

/**
 * Validates curpPaciente per GIIS-B015-04-11 section 9.
 * Throws GeneralError specifying which validation failed.
 * Returns silently if the CURP is valid or is the generic value.
 */
export const validateCurpPaciente = (curp: string): void => {
  // Generic CURP is allowed as an exception (GIIS section 9)
  if (curp === CURP_GENERICA) return

  // 1. Length must be exactly 18 characters
  if (curp.length !== 18) {
    throw new GeneralError('curpPaciente: longitud inválida, debe tener exactamente 18 caracteres')
  }

  // 2. Must be uppercase
  if (curp !== curp.toUpperCase()) {
    throw new GeneralError('curpPaciente: debe estar en mayúsculas')
  }

  // 3. Structure per RENAPO Instructivo Normativo
  const match = curp.match(CURP_REGEX)
  if (!match) {
    throw new GeneralError('curpPaciente: estructura inválida según el Instructivo Normativo de RENAPO')
  }

  // 4. Check digit (dígito verificador)
  const curp17 = match[1]
  const digitoRegistrado = parseInt(match[2], 10)
  const digitoCalculado = calcularDigitoVerificador(curp17)

  if (digitoRegistrado !== digitoCalculado) {
    throw new GeneralError(
      `curpPaciente: dígito verificador inválido (registrado: ${digitoRegistrado}, calculado: ${digitoCalculado})`
    )
  }
}
