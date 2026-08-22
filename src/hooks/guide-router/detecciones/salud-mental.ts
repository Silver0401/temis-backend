import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Salud mental y cognición — GIIS-B019-04-09.
 * Gate: edad >= 10. Los gates finos (memoria >= 60, demencia >= 50) los impone el validador.
 */
export const saludMentalNode: GuideNode = {
  code: 'DET.SALUD_MENTAL',
  guide: 'DET',
  label: 'Salud mental y cognición',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx) && edadMin(ctx, 10),

  schema: schemaDe(['depresionTamizaje', 'depresion', 'ansiedad', 'haOlvidadoMasCosas', 'alteracionesDeMemoria', 'demencia']),

  promptFragment: fragmento('Detecciones — salud mental y cognición', [
    REGLA_TAMIZAJE,
    REGLA_POS_NEG,
    'demencia usa 1 = bajo riesgo, 2 = mediano, 3 = alto.',
    'Sólo llena estas variables si la nota describe el tamizaje o su resultado.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('depresionTamizaje', 'Tamizaje: ¿se siente decaído o deprimido?', cat.TAMIZAJE_SI_NO, draft),
      select('depresion', 'Detección de depresión', cat.POSITIVO_NEGATIVO, draft),
      select('ansiedad', 'Detección de ansiedad', cat.POSITIVO_NEGATIVO, draft),
      select('haOlvidadoMasCosas', 'Tamizaje: ¿ha olvidado más cosas que de costumbre?', cat.TAMIZAJE_SI_NO, draft),
      select('alteracionesDeMemoria', 'Alteraciones de memoria', cat.POSITIVO_NEGATIVO, draft),
      select('demencia', 'Riesgo de demencia', cat.NIVEL_RIESGO, draft),
    ]
}
