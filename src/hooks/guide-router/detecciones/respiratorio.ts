import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección respiratoria — GIIS-B019-04-09.
 * Gate: sintomaticoRespiratorio sin gate de edad; espirometría requiere edad >= 19 y CLUES con espirómetro.
 */
export const respiratorioNode: GuideNode = {
  code: 'DET.RESPIRATORIO',
  guide: 'DET',
  label: 'Detección respiratoria',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx),

  schema: schemaDe(['sintomaticoRespiratorio', 'espirometriaVEF1_CVF', 'espirometriaResultado']),

  promptFragment: fragmento('Detecciones — respiratorio', [
    REGLA_POS_NEG,
    'espirometriaVEF1_CVF es un valor entre 1 y 100; 0 si no se realizó.',
    'La espirometría sólo aplica desde los 19 años y en unidades con espirómetro registrado en el catálogo DIRECTORIO DE CLUES CON ESPIRÓMETRO.',
    'No inventes valores de espirometría: si la nota no los reporta, usa null.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('sintomaticoRespiratorio', 'Probable tuberculosis por estudio', cat.POSITIVO_NEGATIVO, draft),
      select('espirometriaVEF1_CVF', 'Resultado VEF1/CVF de espirometría (1 a 100)', cat.SI_NO, draft),
      select('espirometriaResultado', 'Interpretación de la espirometría', cat.ESPIROMETRIA_RESULTADO, draft),
    ]
}
