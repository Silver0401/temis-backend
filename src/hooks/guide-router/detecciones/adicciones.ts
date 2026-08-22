import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de consumo de sustancias — GIIS-B019-04-09.
 * Gate: sin restricción de edad ni sexo; sólo el gate de tipoPersonal.
 */
export const adiccionesNode: GuideNode = {
  code: 'DET.ADICCIONES',
  guide: 'DET',
  label: 'Detección de consumo de sustancias',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx),

  schema: schemaDe(['alcohol', 'tabaco', 'cannabis', 'cocaina', 'metanfetaminas', 'inhalables', 'opiaceos', 'alucinogenos', 'tranquilizantes', 'otrasSubstancias']),

  promptFragment: fragmento('Detecciones — consumo de sustancias psicoactivas', [
    REGLA_POS_NEG,
    'Positivo significa que se detectó consumo. Si la nota dice que niega consumo, es 1 (negativo).',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('alcohol', 'Alcohol', cat.POSITIVO_NEGATIVO, draft),
      select('tabaco', 'Tabaco', cat.POSITIVO_NEGATIVO, draft),
      select('cannabis', 'Cannabis (marihuana)', cat.POSITIVO_NEGATIVO, draft),
      select('cocaina', 'Cocaína', cat.POSITIVO_NEGATIVO, draft),
      select('metanfetaminas', 'Metanfetaminas', cat.POSITIVO_NEGATIVO, draft),
      select('inhalables', 'Inhalables', cat.POSITIVO_NEGATIVO, draft),
      select('opiaceos', 'Opiáceos', cat.POSITIVO_NEGATIVO, draft),
      select('alucinogenos', 'Alucinógenos', cat.POSITIVO_NEGATIVO, draft),
      select('tranquilizantes', 'Tranquilizantes', cat.POSITIVO_NEGATIVO, draft),
      select('otrasSubstancias', 'Otras sustancias', cat.POSITIVO_NEGATIVO, draft),
    ]
}
