/**
 * Contratos del router de guías GIIS (Temis).
 *
 * Arquitectura de embudo: un router inicial decide qué guías aplican, cada
 * sub-router resuelve sus hojas, y cada hoja devuelve TRES cosas:
 *   1. si aplica            → appliesTo(ctx)
 *   2. qué debe extraer la IA → schema + promptFragment
 *   3. qué debe pintarse      → buildInputs(ctx, draft)
 *
 * Sin el par schema/promptFragment el formulario llegaría vacío y el médico
 * tendría que teclear las 54 variables de Detecciones a mano, que es justo la
 * doble captura que Temis existe para eliminar.
 */
import type { z } from 'zod'
import type { ValueType } from './shared'

/** Códigos de guía de intercambio. */
export type GuideCode = 'CEX' | 'DET' | 'CPF'

/** Sexo biológico según catálogo GIIS B015 campo 17. */
export type SexoBiologico = 1 | 2 | 3

/**
 * Entrada del catálogo DIAGNOSTICO_SIS tal como la eligió el médico.
 * Solo los campos que el ruteo usa; el resto del catálogo viaja pero no importa.
 */
export interface DiagnosticoCatalogo {
  CATALOG_KEY: string
  NOMBRE: string
  LETRA?: string
  CLAVE_CAPITULO?: string
  CAPITULO?: string
  EPI_CLAVE?: number
  DIA_CRONICOS?: string
  DIA_CAINFANTIL?: string
  LSEX?: string
  LINF?: string
  LSUP?: string
  [extra: string]: unknown
}

/**
 * Todo lo que una hoja necesita para decidir y para construir sus inputs.
 * Se arma una sola vez por atención en context.ts.
 */
export interface RoutingContext {
  /** Edad en años cumplidos. null si no se pudo calcular. */
  edad: number | null
  /** 1 HOMBRE, 2 MUJER, 3 INTERSEXUAL. null si falta el dato. */
  sexoBiologico: SexoBiologico | null
  /** Catálogo TIPO PERSONAL – SIS. 30 = TRABAJADORA(OR) SOCIAL, gate de B019. */
  tipoPersonal: number | null
  /** CLUES del establecimiento (primera del médico). */
  clues: string | null
  /** Texto de la nota clínica, ya saneado para la IA. */
  clinicalHistory: string
  /** Señales clínicas que dictaminó el router con IA (embarazo, anticoncepción…). */
  aiFlags: Record<string, boolean>
  /**
   * Diagnósticos CIE que el médico capturó en el buscador, con su entrada
   * completa del catálogo. Es evidencia DURA: cuando el diagnóstico ya dice que
   * la consulta fue una EDA o una IRA, no hace falta preguntárselo a la IA.
   * Vacío mientras el médico no capture ninguno.
   */
  diagnosticos: DiagnosticoCatalogo[]
}

/**
 * Un input suelto tal como lo consume FormCC en el frontend, vía `inputList`.
 * Se dejó de usar `inputGroups`: el formulario final es una lista plana de
 * selects y FormCC la parte en pasos con la prop `steps`.
 */
export type FormInput = Record<string, unknown>

/**
 * Una hoja del embudo: un bloque de variables de una guía.
 * Ejemplos: CEX.EMBARAZO, DET.ITS, CPF.
 */
export interface GuideNode {
  /** Identificador estable, ej. 'DET.ITS'. */
  code: string
  /** Guía a la que pertenece. */
  guide: GuideCode
  /** Etiqueta para el acordeón del formulario. */
  label: string
  /**
   * Gate determinista. Sólo edad, sexo, tipoPersonal, CLUES y aiFlags.
   * Regla: si la guía lo dice con un número, va aquí y NO en el prompt.
   * Cuando el nodo agrupa variables con gates distintos se usa el MÁS LAXO;
   * los gates individuales los impone giis-guide-validator al guardar.
   */
  appliesTo(ctx: RoutingContext): boolean
  /** Slice de Zod con las variables que la IA puede prellenar. */
  schema: z.ZodTypeAny
  /** Fragmento de prompt con las reglas de extracción de esta hoja. */
  promptFragment: string
  /** Lista de inputs que esta hoja aporta al formulario final. */
  buildInputs(ctx: RoutingContext, draft: Record<string, unknown>): FormInput[]
  /** Grupo del record donde persisten estas variables. */
  target:
    | 'General'
    | 'Gynecology'
    | 'Pediatrics'
    | 'Geriatrics'
    | 'Detections'
    | 'FamilyPlanning'
    | 'Administrativas'
}

/** Destino de una variable dentro del record. */
export type GuideTarget = GuideNode['target']

/** Resultado del embudo, listo para devolver al frontend. */
export interface RoutingResult {
  applicableGuides: GuideCode[]
  activeNodes: string[]
  /** Borrador extraído por la IA, agrupado por destino del record. */
  draft: Record<string, Record<string, unknown>>
  /** Inputs ya fusionados y deduplicados, en una sola lista plana. */
  inputList: FormInput[]
  /**
   * A qué grupo del record pertenece cada input, por identifier.
   * Es lo que permite al frontend devolver los valores agrupados sin tener que
   * saber nada de las guías: antes adivinaba con un switch por tipo de consulta
   * y se comía tres grupos enteros.
   */
  fieldTargets: Record<string, GuideTarget>
  /**
   * Cómo debe convertirse el texto del formulario antes de guardarlo, por
   * identifier. Casi todo es entero; las variables multivalor de GIIS son
   * cadena. El frontend no lo deduce: lo sabe el esquema del record.
   */
  fieldTypes: Record<string, ValueType>
  /** Número de pasos en que FormCC debe partir la lista. undefined = un solo paso. */
  steps?: number
}
