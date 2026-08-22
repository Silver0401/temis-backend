import { GeneralError } from '@feathersjs/errors'

const VALID_CHARS_NO_ACCENTS_REGEX = /^[A-ZÑ\-,./'"¨ ]+$/
const VALID_CHARS_REGEX = /^[A-ZÁÉÍÓÚÜÑ\-,./'"¨ ]+$/
// For segundoApellido the spec explicitly forbids two *same or different* specials consecutively
const CONSECUTIVE_SPECIALS_REGEX = /[\-,./'"¨]{2,}/
const CONSECUTIVE_SPACES_REGEX = /  +/

/**
 * Validates segundoApellido del paciente per GIIS-B015-04-11 section 12.
 * Throws GeneralError specifying which validation failed.
 *
 * When the patient has no second surname, the caller must register "XX" — this
 * function accepts "XX" as a valid value for that case.
 *
 * Note: cross-field validation (segundoApellido must correspond with curpPaciente)
 * should be performed at the hook level after calling this function.
 */
export const validateSegundoApellidoPaciente = (segundoApellido: string): void => {
  // "XX" is the accepted placeholder when no second surname exists (GIIS section 12)
  if (segundoApellido === 'XX') return

  // 1. Leading/trailing spaces are not allowed
  if (segundoApellido !== segundoApellido.trim()) {
    throw new GeneralError('segundoApellido: no se permiten espacios en blanco al inicio o al final')
  }

  // 2. Length: 2–50 characters
  if (segundoApellido.length < 2 || segundoApellido.length > 50) {
    throw new GeneralError(
      'segundoApellido: debe tener una longitud mínima de 2 y máxima de 50 caracteres'
    )
  }

  // 3. No consecutive spaces
  if (CONSECUTIVE_SPACES_REGEX.test(segundoApellido)) {
    throw new GeneralError('segundoApellido: no se permite más de un espacio consecutivo')
  }

  // 4. No accented vowels — only A-Z and Ñ in uppercase
  if (!VALID_CHARS_NO_ACCENTS_REGEX.test(segundoApellido)) {
    if (VALID_CHARS_REGEX.test(segundoApellido)) {
      throw new GeneralError(
        'segundoApellido: no se permiten acentos, solo caracteres A-Z incluyendo Ñ en mayúsculas'
      )
    }
    throw new GeneralError(
      'segundoApellido: solo se permiten caracteres A-Z incluyendo Ñ en mayúsculas y los especiales: guion medio, coma, punto, diagonal, apóstrofe y diéresis'
    )
  }

  // 5. No consecutive special characters (same or different — stricter rule per section 12)
  if (CONSECUTIVE_SPECIALS_REGEX.test(segundoApellido)) {
    throw new GeneralError(
      'segundoApellido: no se permite el registro de más de un mismo o diferente carácter especial de manera consecutiva'
    )
  }
}
