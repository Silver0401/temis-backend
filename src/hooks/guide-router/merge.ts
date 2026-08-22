/**
 * Embudo de salida: junta lo que devolvieron las hojas en UN solo formulario.
 *
 * Tres cosas, en orden:
 *   1. concatenar los inputs en el orden de las guías (CEX, DET, CPF)
 *   2. deduplicar por identifier — gana el primero, que es el de la guía base
 *   3. calcular en cuántos pasos debe partirlo FormCC
 *
 * El formulario final es una lista PLANA (`inputList`), no `inputGroups`:
 * FormCC reparte esa lista entre los pasos con Math.ceil(length / steps).
 */
import type { ValueType } from './shared'
import type { FormInput, GuideNode, GuideTarget, RoutingContext } from './types'

/** Extrae el identifier de un input, si lo trae. */
const idDe = (input: FormInput): string | null =>
  typeof input.identifier === 'string' ? input.identifier : null

/** Inputs por paso al que se aspira. */
const INPUTS_POR_PASO = 5

/** Debajo de este número el formulario se muestra de una sola vez. */
const MINIMO_PARA_PARTIR = 5

/**
 * Cuántos pasos merece una lista de `length` inputs.
 *
 * Menos de 5 inputs: sin pasos, se pintan todos juntos.
 * De 5 en adelante: se parte en trozos de ~5, que es lo que FormCC respeta al
 * hacer Math.ceil(length / steps). El mínimo de 2 evita que una lista de 5 o 6
 * quede en un solo paso pese a haber cruzado el umbral.
 * Ejemplos: 5→2 (3 y 2), 6→2 (3 y 3), 10→2 (5 y 5), 15→3 (5 por paso),
 * 20→4 (5 por paso).
 */
export const calcularSteps = (length: number): number | undefined => {
  if (length < MINIMO_PARA_PARTIR) return undefined
  return Math.max(2, Math.ceil(length / INPUTS_POR_PASO))
}

/**
 * Fusiona los inputs de todas las hojas activas en una sola lista.
 * La deduplicación importa porque varias guías comparten nombre de variable
 * (cartillaSalud vive en CEX y en DET): sólo debe pedirse una vez al médico.
 */
export const mergeInputList = (
  nodes: GuideNode[],
  ctx: RoutingContext,
  draft: Record<string, Record<string, unknown>>
): FormInput[] => {
  const vistos = new Set<string>()
  const salida: FormInput[] = []

  for (const node of nodes) {
    const draftDelNodo = draft[node.target] ?? {}
    for (const input of node.buildInputs(ctx, draftDelNodo)) {
      const id = idDe(input)
      if (id) {
        if (vistos.has(id)) continue
        vistos.add(id)
      }
      salida.push(input)
    }
  }

  return salida
}

/**
 * Mapa identifier → grupo del record, en el mismo orden de precedencia que
 * `mergeInputList`: gana la primera hoja que aporta el input.
 */
export const mapFieldTargets = (
  nodes: GuideNode[],
  ctx: RoutingContext,
  draft: Record<string, Record<string, unknown>>
): Record<string, GuideTarget> => {
  const targets: Record<string, GuideTarget> = {}

  for (const node of nodes) {
    for (const input of node.buildInputs(ctx, draft[node.target] ?? {})) {
      const id = idDe(input)
      if (id && !targets[id]) targets[id] = node.target
    }
  }

  return targets
}

/** Mapa identifier → cómo convertir su valor. Por defecto, entero. */
export const mapFieldTypes = (
  nodes: GuideNode[],
  ctx: RoutingContext,
  draft: Record<string, Record<string, unknown>>
): Record<string, ValueType> => {
  const tipos: Record<string, ValueType> = {}

  for (const node of nodes) {
    for (const input of node.buildInputs(ctx, draft[node.target] ?? {})) {
      const id = idDe(input)
      if (id && !tipos[id]) tipos[id] = ((input as any).valueType as ValueType) ?? 'integer'
    }
  }

  return tipos
}

/** Agrupa el borrador extraído por destino del record. */
export const agruparPorTarget = (
  nodes: GuideNode[],
  extraido: Record<string, unknown>
): Record<string, Record<string, unknown>> => {
  const porTarget: Record<string, Record<string, unknown>> = {}

  for (const node of nodes) {
    const shape = (node.schema as any)?.shape ?? {}
    for (const nombre of Object.keys(shape)) {
      const valor = extraido[nombre]
      if (valor === undefined || valor === null) continue
      porTarget[node.target] ??= {}
      porTarget[node.target][nombre] = valor
    }
  }

  return porTarget
}
