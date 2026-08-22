/**
 * Parses an identification block (output of splitByIdentification) into
 * typed GIIS fields ready to be passed to the validation functions.
 *
 * Expected format per line:
 *   - Key: Value
 */
export interface ParsedIdentification {
  curpPaciente: string
  nombre: string
  primerApellido: string
  segundoApellido: string
  fechaNacimiento: string
  sexo: string
  genero: string
  derechohabiencia: string
  // raw full name in case the caller wants it for cross-field checks
  nombreCompleto: string
}

function extractField(text: string, key: string): string {
  const match = text.match(new RegExp(`^\\s*-\\s*${key}\\s*:\\s*(.+)$`, 'im'))
  return match ? match[1].trim() : ''
}

/**
 * Splits a full Mexican name "Nombre(s) ApellidoPaterno ApellidoMaterno"
 * into its three GIIS components.
 *
 * Convention: last token = segundoApellido, second-to-last = primerApellido,
 * everything before = nombre(s).
 * If only two tokens are found, segundoApellido falls back to "XX".
 */
function splitNombreCompleto(nombreCompleto: string): {
  nombre: string
  primerApellido: string
  segundoApellido: string
} {
  const parts = nombreCompleto.trim().split(/\s+/)

  if (parts.length >= 3) {
    return {
      nombre: parts.slice(0, parts.length - 2).join(' '),
      primerApellido: parts[parts.length - 2],
      segundoApellido: parts[parts.length - 1]
    }
  }

  if (parts.length === 2) {
    return { nombre: parts[0], primerApellido: parts[1], segundoApellido: 'XX' }
  }

  return { nombre: parts[0] ?? '', primerApellido: 'XX', segundoApellido: 'XX' }
}

export function parseIdentification(identificationBlock: string): ParsedIdentification {
  const nombreCompleto = extractField(identificationBlock, 'Nombre')
  const { nombre, primerApellido, segundoApellido } = splitNombreCompleto(nombreCompleto)

  return {
    nombreCompleto,
    nombre,
    primerApellido,
    segundoApellido,
    curpPaciente: extractField(identificationBlock, 'CURP'),
    fechaNacimiento: extractField(identificationBlock, 'Nac'),
    sexo: extractField(identificationBlock, 'Sexo'),
    genero: extractField(identificationBlock, 'Genero'),
    derechohabiencia: extractField(identificationBlock, 'Derechohabiencia')
  }
}
