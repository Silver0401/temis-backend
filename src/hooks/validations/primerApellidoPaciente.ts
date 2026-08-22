import { GeneralError } from '@feathersjs/errors'

const VALID_CHARS_NO_ACCENTS_REGEX = /^[A-ZÑ\-,./'"¨ ]+$/
const VALID_CHARS_REGEX = /^[A-ZÁÉÍÓÚÜÑ\-,./'"¨ ]+$/
const CONSECUTIVE_SPECIALS_REGEX = /[\-,./'"¨]{2,}/
const CONSECUTIVE_SPACES_REGEX = /  +/

/**
 * Validates primerApellido del paciente per GIIS-B015-04-11 section 11.
 * Throws GeneralError specifying which validation failed.
 *
 * When the patient has no first surname, the caller must register "XX" — this
 * function accepts "XX" as a valid value for that case.
 *
 * Note: cross-field validation (primerApellido must correspond with curpPaciente)
 * should be performed at the hook level after calling this function.
 */
export const validatePrimerApellidoPaciente = (primerApellido: string): void => {
  // "XX" is the accepted placeholder when no first surname exists (GIIS section 11)
  if (primerApellido === 'XX') return

  // 1. Leading/trailing spaces are not allowed
  if (primerApellido !== primerApellido.trim()) {
    throw new GeneralError('primerApellido: no se permiten espacios en blanco al inicio o al final')
  }

  // 2. Length: 2–50 characters
  if (primerApellido.length < 2 || primerApellido.length > 50) {
    throw new GeneralError(
      'primerApellido: debe tener una longitud mínima de 2 y máxima de 50 caracteres'
    )
  }

  // 3. No consecutive spaces
  if (CONSECUTIVE_SPACES_REGEX.test(primerApellido)) {
    throw new GeneralError('primerApellido: no se permite más de un espacio consecutivo')
  }

  // 4. No accented vowels — only A-Z and Ñ in uppercase
  if (!VALID_CHARS_NO_ACCENTS_REGEX.test(primerApellido)) {
    if (VALID_CHARS_REGEX.test(primerApellido)) {
      throw new GeneralError(
        'primerApellido: no se permiten acentos, solo caracteres A-Z incluyendo Ñ en mayúsculas'
      )
    }
    throw new GeneralError(
      'primerApellido: solo se permiten caracteres A-Z incluyendo Ñ en mayúsculas y los especiales: guion medio, coma, punto, diagonal, apóstrofe y diéresis'
    )
  }

  // 5. No consecutive special characters
  if (CONSECUTIVE_SPECIALS_REGEX.test(primerApellido)) {
    throw new GeneralError(
      'primerApellido: no se permite el registro de más de un carácter especial de manera consecutiva'
    )
  }
}
