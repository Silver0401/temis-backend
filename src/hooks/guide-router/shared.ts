/**
 * Utilidades compartidas por las hojas del router.
 * Evita repetir el mismo boilerplate de Zod y de construcción de inputs 15 veces.
 */
import { z } from 'zod'
import type { Opcion } from './catalogs'

/** Slice de Zod para una variable numérica de catálogo (nullable = sin dato). */
export const codigo = () => z.number().int().nullable()

/** Slice para una variable decimal (ej. LIN de espirometría). */
export const decimal = () => z.number().nullable()

/** Construye un objeto Zod estricto a partir de una lista de nombres. */
export const schemaDe = (nombres: string[]) =>
  z.object(Object.fromEntries(nombres.map((n) => [n, codigo()]))).strict()

/**
 * Tipo del valor que el record espera para una variable.
 *
 * El formulario devuelve texto siempre; quien sabe si ese texto debe guardarse
 * como entero o como cadena es el esquema del record. Sin este dato el frontend
 * adivinaba —convertía todo a entero— y mandaba un número a los campos
 * declarados `Type.String()`.
 */
export type ValueType = 'integer' | 'string'

/** Un input select listo para FormCC, con la convención "N - Etiqueta". */
export const select = (
  identifier: string,
  label: string,
  opciones: Opcion[],
  draft: Record<string, unknown>
) => {
  const options = opciones.map((op) => `${op.value} - ${op.label}`)
  const actual = draft[identifier]
  return {
    type: 'select',
    identifier,
    label,
    options,
    initialValue: typeof actual === 'number' ? options.find((op) => op.startsWith(`${actual} -`)) : undefined,
    disableSessionSave: true,
    valueType: 'integer' as ValueType
  }
}

/**
 * Igual que `select`, pero la clave del catálogo se guarda como TEXTO.
 * Lo piden las variables multivalor de GIIS, que admiten varias claves unidas
 * por "&" y por eso están declaradas como cadena en el esquema del record.
 */
export const selectTexto = (
  identifier: string,
  label: string,
  opciones: Opcion[],
  draft: Record<string, unknown>
) => ({ ...select(identifier, label, opciones, draft), valueType: 'string' as ValueType })

/** Un input numérico libre (ej. cantidades entregadas de un método). */
export const numero = (
  identifier: string,
  label: string,
  draft: Record<string, unknown>,
  opts: { min?: number; max?: number } = {}
) => ({
  type: 'number',
  identifier,
  label,
  initialValue: typeof draft[identifier] === 'number' ? String(draft[identifier]) : undefined,
  validations: { min: opts.min ?? -1, max: opts.max ?? 999 },
  disableSessionSave: true,
  valueType: 'integer' as ValueType
})

/** Describe un bloque de variables para el prompt de extracción. */
export const fragmento = (titulo: string, reglas: string[]): string =>
  `### ${titulo}\n${reglas.map((r) => `- ${r}`).join('\n')}`

/** Regla de prompt reutilizable: catálogo 0 POSITIVO / 1 NEGATIVO. */
export const REGLA_POS_NEG =
  'Para estas variables: 0 = resultado POSITIVO, 1 = resultado NEGATIVO, -1 = no aplica explícito, null = sin dato suficiente. No inventes resultados de estudios que el texto no menciona.'

/** Regla de prompt reutilizable: tamizaje 0 NO / 1 SI. */
export const REGLA_TAMIZAJE =
  'Para estos tamizajes: 0 = NO, 1 = SÍ, -1 = no aplica explícito, null = sin dato suficiente.'
