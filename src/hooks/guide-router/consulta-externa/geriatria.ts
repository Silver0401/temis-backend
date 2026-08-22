import { edadMin, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Intervenciones gerontológicas — GIIS-B015-04-11.
 * Gate: edad >= 60 o la IA detecta valoración gerontológica.
 */
export const geriatriaNode: GuideNode = {
  code: 'CEX.GERIATRIA',
  guide: 'CEX',
  label: 'Intervenciones gerontológicas',
  target: 'Geriatrics',

  appliesTo: (ctx: RoutingContext) => edadMin(ctx, 60) || ctx.aiFlags.geriatria === true,

  schema: schemaDe(['sintomaDepresiva', 'alteracionMemoria', 'aivd-ABVD', 'sindromeCaidas', 'incontinenciaUrinaria', 'motricidad', 'asesoriaNutricional']),

  promptFragment: fragmento('Consulta externa — intervenciones gerontológicas', [
    'Estas variables describen INTERVENCIONES realizadas por gerontología: 1 = intervención preventiva, 2 = tratamiento, -1 = no aplica.',
    'No las confundas con las detecciones de la guía B019, que son tamizajes.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('sintomaDepresiva', 'Intervención por sintomatología depresiva', cat.SI_NO, draft),
      select('alteracionMemoria', 'Intervención por alteración de la memoria', cat.SI_NO, draft),
      select('aivd-ABVD', 'Intervención en actividades de la vida diaria', cat.SI_NO, draft),
      select('sindromeCaidas', 'Intervención por síndrome de caídas', cat.SI_NO, draft),
      select('incontinenciaUrinaria', 'Intervención por incontinencia urinaria', cat.SI_NO, draft),
      select('motricidad', 'Intervención en motricidad', cat.SI_NO, draft),
      select('asesoriaNutricional', 'Asesoría nutricional', cat.SI_NO, draft),
    ]
}
