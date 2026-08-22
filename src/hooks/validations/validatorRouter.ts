import { GeneralError } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'
import { splitByIdentification } from '../../json/Generator'
import { parseIdentification } from './identificationParser'
import { validateCurpPaciente } from './curpPaciente'
import { validateNombrePaciente } from './nombrePaciente'
import { validatePrimerApellidoPaciente } from './primerApellidoPaciente'
import { validateSegundoApellidoPaciente } from './segundoApellidoPaciente'

/**
 * Runs every field-level GIIS validator against the identification block
 * embedded in the patient's ClinicalHistory text.
 *
 * Collects ALL validation errors before throwing so the caller receives
 * the full list in a single GeneralError, instead of failing on the first one.
 */
export const patientIdentificationValidator = async (context: HookContext) => {
  const clinicalHistoryText: string = context.data?.ClinicalHistory ?? ''

  const { identification } = splitByIdentification(clinicalHistoryText)

  if (!identification) {
    throw new GeneralError(
      'validatorRouter: no se encontró la sección "Ficha de Identificación" en el historial clínico'
    )
  }

  const parsed = parseIdentification(identification)
  const errors: string[] = []

  const run = (label: string, fn: () => void) => {
    try {
      fn()
    } catch (e: any) {
      errors.push(`[${label}] ${e.message}`)
    }
  }

  run('curpPaciente', () => validateCurpPaciente(parsed.curpPaciente))
  run('nombre', () => validateNombrePaciente(parsed.nombre))
  run('primerApellido', () => validatePrimerApellidoPaciente(parsed.primerApellido))
  run('segundoApellido', () => validateSegundoApellidoPaciente(parsed.segundoApellido))

  if (errors.length > 0) {
    throw new GeneralError('Errores de validación en la Ficha de Identificación', { errors })
  }

  return context
}
