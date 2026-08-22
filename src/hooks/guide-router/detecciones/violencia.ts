import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de violencia — GIIS-B019-04-09.
 * Gate: violenciaSexual sin gate; violenciaMujer15yMas requiere mujer y edad >= 15.
 */
export const violenciaNode: GuideNode = {
  code: 'DET.VIOLENCIA',
  guide: 'DET',
  label: 'Detección de violencia',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => true,

  schema: schemaDe(['violenciaSexual', 'violenciaMujer15yMas']),

  promptFragment: fragmento('Detecciones — violencia', [
    REGLA_POS_NEG,
    'violenciaMujer15yMas sólo aplica si el sexo biológico es mujer y la edad es 15 o más.',
    'Es información sensible: no la infieras, sólo regístrala si la nota lo documenta explícitamente.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('violenciaSexual', 'Violencia sexual por agresor distinto a la pareja', cat.POSITIVO_NEGATIVO, draft),
      select('violenciaMujer15yMas', 'Violencia de pareja en mujer de 15 y más', cat.POSITIVO_NEGATIVO, draft),
    ]
}
