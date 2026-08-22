import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de enfermedades crónicas — GIIS-B019-04-09.
 * Gate: edad >= 20.
 */
export const cronicasNode: GuideNode = {
  code: 'DET.CRONICAS',
  guide: 'DET',
  label: 'Detección de enfermedades crónicas',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx) && edadMin(ctx, 20),

  schema: schemaDe(['diabetesMellitus', 'hipertensionArterial', 'obesidad', 'dislipidemias']),

  promptFragment: fragmento('Detecciones — enfermedades crónicas', [
    REGLA_POS_NEG,
    'No infieras diabetes u obesidad a partir de la somatometría: sólo si la nota reporta la detección.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('diabetesMellitus', 'Detección de diabetes mellitus', cat.POSITIVO_NEGATIVO, draft),
      select('hipertensionArterial', 'Detección de hipertensión arterial', cat.POSITIVO_NEGATIVO, draft),
      select('obesidad', 'Detección de obesidad', cat.POSITIVO_NEGATIVO, draft),
      select('dislipidemias', 'Detección de dislipidemias', cat.POSITIVO_NEGATIVO, draft),
    ]
}
