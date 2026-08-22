import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de infecciones de transmisión sexual — GIIS-B019-04-09.
 * Gate: sin restricción de edad ni sexo; sólo el gate de tipoPersonal.
 */
export const itsNode: GuideNode = {
  code: 'DET.ITS',
  guide: 'DET',
  label: 'Detección de infecciones de transmisión sexual',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx),

  schema: schemaDe(['B24X', 'A539', 'gonorrea', 'hepatitisB', 'herpesGenital', 'chlamydia']),

  promptFragment: fragmento('Detecciones — infecciones de transmisión sexual', [
    'Cada variable indica el TIPO de prueba y su resultado, no un sí/no. Usa null si la nota no dice qué prueba se hizo.',
    '-1 cuando no se realizó ninguna prueba para esa infección.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('B24X', 'VIH (B24X)', cat.PRUEBA_ITS, draft),
      select('A539', 'Sífilis (A539)', cat.PRUEBA_ITS, draft),
      select('gonorrea', 'Gonorrea', cat.PRUEBA_ITS, draft),
      select('hepatitisB', 'Hepatitis B', cat.PRUEBA_ITS, draft),
      select('herpesGenital', 'Herpes genital', cat.PRUEBA_ITS, draft),
      select('chlamydia', 'Clamidia', cat.PRUEBA_ITS, draft),
    ]
}
