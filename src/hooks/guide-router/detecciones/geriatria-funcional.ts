import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Geriatría funcional — GIIS-B019-04-09.
 * Gate: edad >= 60. riesgoFractura aplica desde los 50; se incluye aquí por ser el gate más laxo del bloque.
 */
export const geriatriaFuncionalNode: GuideNode = {
  code: 'DET.GERIATRIA_FUNCIONAL',
  guide: 'DET',
  label: 'Geriatría funcional',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx) && edadMin(ctx, 50),

  schema: schemaDe(['tamizajeFugaDeOrina', 'incontinenciaUriaria', 'tamizajeCaidas', 'caida60yMas', 'marcha', 'estadoNutricional', 'abvdTamizaje', 'abvdEvaluacion', 'aivdTamizaje', 'aivdEvaluacion', 'edadCuidador', 'sexoCuidador', 'sobrecargaCuidador', 'riesgoFractura']),

  promptFragment: fragmento('Detecciones — geriatría funcional', [
    REGLA_TAMIZAJE,
    REGLA_POS_NEG,
    'sexoCuidador y sobrecargaCuidador sólo se llenan si edadCuidador es distinto de -1.',
    'riesgoFractura usa 1 = bajo, 2 = mediano, 3 = alto.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('tamizajeFugaDeOrina', 'Tamizaje: ¿ha tenido fuga de orina?', cat.TAMIZAJE_SI_NO, draft),
      select('incontinenciaUriaria', 'Incontinencia urinaria', cat.POSITIVO_NEGATIVO, draft),
      select('tamizajeCaidas', 'Tamizaje: ¿ha tenido caídas?', cat.TAMIZAJE_SI_NO, draft),
      select('caida60yMas', 'Caída en persona de 60 y más', cat.POSITIVO_NEGATIVO, draft),
      select('marcha', 'Evaluación de la estabilidad de la marcha', cat.POSITIVO_NEGATIVO, draft),
      select('estadoNutricional', 'Evaluación del estado nutricional', cat.POSITIVO_NEGATIVO, draft),
      select('abvdTamizaje', 'Tamizaje de actividades básicas de la vida diaria', cat.TAMIZAJE_SI_NO, draft),
      select('abvdEvaluacion', 'Evaluación de actividades básicas de la vida diaria', cat.POSITIVO_NEGATIVO, draft),
      select('aivdTamizaje', 'Tamizaje de actividades instrumentales de la vida diaria', cat.TAMIZAJE_SI_NO, draft),
      select('aivdEvaluacion', 'Evaluación de actividades instrumentales de la vida diaria', cat.POSITIVO_NEGATIVO, draft),
      select('edadCuidador', 'Edad de la persona cuidadora', cat.EDAD_CUIDADOR, draft),
      select('sexoCuidador', 'Sexo de la persona cuidadora', cat.SEXO_CUIDADOR, draft),
      select('sobrecargaCuidador', 'Sobrecarga de la persona cuidadora', cat.POSITIVO_NEGATIVO, draft),
      select('riesgoFractura', 'Riesgo de fractura por fragilidad', cat.NIVEL_RIESGO, draft),
    ]
}
