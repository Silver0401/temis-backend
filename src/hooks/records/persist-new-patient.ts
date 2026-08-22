import type { HookContext } from '../../declarations'
import { esSintesis } from './synthesize-preview'

/**
 * PASO 6 y último del alta: crea el paciente y le cuelga el registro.
 *
 * En modo síntesis no se guarda nada: esa llamada solo arma el formulario que
 * el médico va a confirmar.
 */
export const persistNewPatient = async (context: HookContext) => {
  if (esSintesis(context)) return context
  if (!context.params.isNewPatient) return context

  const CreatePatient = await context.app
    .service('patients')
    .create(context.params.pendingPatientData, context.params)

  context.params.patientData = CreatePatient
  context.data = {
    ...context.data,
    // @ts-ignore
    patientId: CreatePatient._id
  }

  return context
}
