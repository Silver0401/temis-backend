import { edadMin, edadEntre, esSexo, noEsTrabajoSocial } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, REGLA_POS_NEG, REGLA_TAMIZAJE } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Detección de cáncer y sospecha genética — GIIS-B019-04-09.
 * Gate: VPH: mujer 35-64. CaCu: sexo 2 o 3, 25-64. Mama y Turner sin gate de edad.
 */
export const cancerNode: GuideNode = {
  code: 'DET.CANCER',
  guide: 'DET',
  label: 'Detección de cáncer y sospecha genética',
  target: 'Detections',

  appliesTo: (ctx: RoutingContext) => noEsTrabajoSocial(ctx) && esSexo(ctx, 2, 3),

  schema: schemaDe(['resultadoVPH', 'cancerCervicoUterino', 'resultadoCancerCervicoUterino', 'cancerMama', 'sospechaSindromeTurner']),

  promptFragment: fragmento('Detecciones — cáncer y sospecha genética', [
    'cancerCervicoUterino y resultadoCancerCervicoUterino son excluyentes: si una tiene valor, la otra debe ser -1.',
    'resultadoVPH sólo aplica a mujeres de 35 a 64 años.',
    'cancerMama usa 0 = normal, 1 = anormal.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('resultadoVPH', 'Resultado de prueba de VPH', cat.POSITIVO_NEGATIVO, draft),
      select('cancerCervicoUterino', 'Detección de cáncer cervicouterino', cat.REALIZADO, draft),
      select('resultadoCancerCervicoUterino', 'Resultado de cáncer cervicouterino', cat.POSITIVO_NEGATIVO, draft),
      select('cancerMama', 'Detección de cáncer de mama', cat.NORMAL_ANORMAL, draft),
      select('sospechaSindromeTurner', 'Sospecha de síndrome de Turner', cat.POSITIVO_NEGATIVO, draft),
    ]
}
