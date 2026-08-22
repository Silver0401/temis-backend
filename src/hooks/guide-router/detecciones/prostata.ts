import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de patología prostática — GIIS-B019-04-09.
 * Gate: hombre con edad >= 40.
 */
export const prostataNode: GuideNode = {
  code: 'DET.PROSTATA',
  guide: 'DET',
  label: 'Detección de patología prostática',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx) && esSexo(ctx, 1) && edadMin(ctx, 40),

  schema: schemaDe(['hiperplasiaProstatica', 'reactivosAntigenoProstatico']),

  promptFragment: fragmento('Detecciones — próstata', [
    REGLA_POS_NEG,
    'reactivosAntigenoProstatico es una CANTIDAD entre 1 y 9, obligatoria cuando hiperplasiaProstatica es distinta de -1; en caso contrario vale 0.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('hiperplasiaProstatica', 'Hiperplasia prostática', cat.POSITIVO_NEGATIVO, draft),
      select('reactivosAntigenoProstatico', 'Reactivos de antígeno prostático usados (1 a 9)', cat.SI_NO, draft),
    ]
}
