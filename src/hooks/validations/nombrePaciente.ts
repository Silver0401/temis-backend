import { GeneralError } from '@feathersjs/errors'

// Valid chars: A-Z including Ñ, uppercase only
// Allowed specials: hyphen, comma, period, slash, apostrophe, diaeresis
const VALID_CHARS_REGEX = /^[A-ZÁÉÍÓÚÜÑ\-,./'"¨ ]+$/
const VALID_CHARS_NO_ACCENTS_REGEX = /^[A-ZÑ\-,./'"¨ ]+$/
const CONSECUTIVE_SPECIALS_REGEX = /[\-,./'"¨]{2,}/
const CONSECUTIVE_SPACES_REGEX = /  +/

/**
 * Validates nombre(s) del paciente per GIIS-B015-04-11 section 10.
 * Throws GeneralError specifying which validation failed.
 *
 * Note: cross-field validation (nombre must correspond with curpPaciente)
 * should be performed at the hook level after calling this function.
 */
export const validateNombrePaciente = (nombre: string): void => {
  // 1. Leading/trailing spaces are not allowed
  if (nombre !== nombre.trim()) {
    throw new GeneralError('nombre: no se permiten espacios en blanco al inicio o al final')
  }

  // 2. Length: 2–50 characters
  if (nombre.length < 2 || nombre.length > 50) {
    throw new GeneralError('nombre: debe tener una longitud mínima de 2 y máxima de 50 caracteres')
  }

  // 3. No consecutive spaces
  if (CONSECUTIVE_SPACES_REGEX.test(nombre)) {
    throw new GeneralError('nombre: no se permite más de un espacio consecutivo')
  }

  // 4. No accented vowels (á, é, í, ó, ú are not allowed — only A-Z and Ñ)
  if (!VALID_CHARS_NO_ACCENTS_REGEX.test(nombre)) {
    // Distinguish between accent error and fully invalid char
    if (VALID_CHARS_REGEX.test(nombre)) {
      throw new GeneralError('nombre: no se permiten acentos, solo caracteres A-Z incluyendo Ñ en mayúsculas')
    }
    throw new GeneralError(
      'nombre: solo se permiten caracteres A-Z incluyendo Ñ en mayúsculas y los especiales: guion medio, coma, punto, diagonal, apóstrofe y diéresis'
    )
  }

  // 5. No consecutive special characters
  if (CONSECUTIVE_SPECIALS_REGEX.test(nombre)) {
    throw new GeneralError('nombre: no se permite el registro de más de un carácter especial de manera consecutiva')
  }
}
