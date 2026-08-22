import type { HookContext } from '../../declarations'

/** ¿Esta llamada es la mitad de previsualización del alta? */
export const esSintesis = (context: HookContext): boolean => context.params?.query?.synthesize === true

/**
 * PASO 5 del alta: en modo síntesis devuelve el formulario y corta.
 *
 * Fijar `context.result` salta la escritura en Mongo, pero NO salta los hooks
 * que vienen después: `persistNewPatient` tiene su propia guarda de síntesis.
 */
export const synthesizePreview = async (context: HookContext) => {
  if (!esSintesis(context)) return context

  context.result = {
    record: context.data,
    // Guías aplicables, hojas activas, borrador extraído por la IA, los inputs
    // ya fusionados en un formulario y a qué grupo del record pertenece cada uno.
    routing: (context.params as any).routing ?? null,
    pendingPatientData: context.params.pendingPatientData ?? null
  } as any

  return context
}
