/**
 * Catálogos de opciones de las guías GIIS, transcritos del diccionario de datos.
 *
 * Convención de la columna VALIDACIÓN de B019: la mayoría de las detecciones
 * usan 0 = POSITIVO y 1 = NEGATIVO (sí, invertido respecto a un sí/no normal),
 * y -1 cuando se desconoce o no aplica. Los tamizajes usan 0 = NO y 1 = SI.
 */

export interface Opcion {
  value: number
  label: string
}

const o = (value: number, label: string): Opcion => ({ value, label })

/** -1 se desconoce / no aplica. Presente en casi todas las variables. */
export const NO_APLICA = o(-1, 'No aplica o se desconoce')

/** Resultado de detección: 0 POSITIVO, 1 NEGATIVO. */
export const POSITIVO_NEGATIVO: Opcion[] = [NO_APLICA, o(0, 'Positivo'), o(1, 'Negativo')]

/** Tamizaje de pregunta directa: 0 NO, 1 SI. */
export const TAMIZAJE_SI_NO: Opcion[] = [NO_APLICA, o(0, 'No'), o(1, 'Sí')]

/** Escala de riesgo de tres niveles (demencia 44, riesgoFractura 58). */
export const NIVEL_RIESGO: Opcion[] = [
  NO_APLICA,
  o(1, 'Bajo riesgo'),
  o(2, 'Mediano riesgo'),
  o(3, 'Alto riesgo')
]

/** Rango etario del cuidador (55). */
export const EDAD_CUIDADOR: Opcion[] = [
  NO_APLICA,
  o(1, 'Menor de 20 años'),
  o(2, '20 a 59 años de edad'),
  o(3, '60 y más años de edad')
]

/** Sexo del cuidador (56). */
export const SEXO_CUIDADOR: Opcion[] = [NO_APLICA, o(1, 'Hombre'), o(2, 'Mujer')]

/** Realización de un estudio (cancerCervicoUterino 80). */
export const REALIZADO: Opcion[] = [NO_APLICA, o(0, 'No realizado'), o(1, 'Realizado')]

/** Resultado de estudio de mama (82). */
export const NORMAL_ANORMAL: Opcion[] = [NO_APLICA, o(0, 'Normal'), o(1, 'Anormal')]

/** Sí/No estándar de B015 (cartillas, línea de vida, telemedicina...). */
export const SI_NO: Opcion[] = [NO_APLICA, o(0, 'No'), o(1, 'Sí')]

/** Relación temporal de B015: 0 primera vez, 1 subsecuente. */
export const RELACION_TEMPORAL: Opcion[] = [NO_APLICA, o(0, 'Primera vez'), o(1, 'Subsecuente')]

/**
 * Catálogo de pruebas de ITS (campos 73-78).
 *
 * ⚠️ PENDIENTE DE COTEJO. La guía define hasta 10 opciones por variable, con
 * variantes de 1a/2a detección, prueba rápida y prueba confirmatoria, y el
 * texto exacto difiere entre VIH, sífilis, gonorrea, hepatitis B, herpes y
 * clamidia. Aquí se transcribió la estructura común observada; antes de la
 * verificación oficial hay que cotejar etiqueta por etiqueta contra el PDF
 * GIIS-B019-04-09, sección del diccionario de datos.
 */
export const PRUEBA_ITS: Opcion[] = [
  NO_APLICA,
  o(1, '1a detección prueba rápida reactiva'),
  o(2, '1a detección prueba rápida no reactiva'),
  o(3, '1a detección reactiva'),
  o(4, '1a detección no reactiva'),
  o(5, '2a detección prueba rápida reactiva'),
  o(6, '2a detección prueba rápida no reactiva'),
  o(7, '2a detección reactiva'),
  o(8, '2a detección no reactiva'),
  o(9, 'Prueba confirmatoria y/o suplementaria positiva'),
  o(10, 'Prueba confirmatoria y/o suplementaria negativa')
]

/**
 * Resultado de espirometría (91).
 * ⚠️ PENDIENTE DE COTEJO por la misma razón que PRUEBA_ITS.
 */
export const ESPIROMETRIA_RESULTADO: Opcion[] = [
  NO_APLICA,
  o(1, 'Normal con respuesta a broncodilatador'),
  o(2, 'Normal sin respuesta a broncodilatador'),
  o(3, 'Obstruido con respuesta a broncodilatador'),
  o(4, 'Obstruido sin respuesta a broncodilatador'),
  o(5, 'Sugiere restricción con respuesta'),
  o(6, 'Sugiere restricción sin respuesta'),
  o(7, 'Sugiere patrón mixto con respuesta'),
  o(8, 'Sugiere patrón mixto sin respuesta'),
  o(9, 'Patrón no específico con respuesta'),
  o(10, 'Patrón no específico sin respuesta')
]
