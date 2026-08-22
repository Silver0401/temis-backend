import { edadMin, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento, selectTexto } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Variables generales de la consulta — GIIS-B015-04-11.
 * Gate: siempre.
 */
export const cexBaseNode: GuideNode = {
  code: 'CEX.BASE',
  guide: 'CEX',
  label: 'Variables generales de la consulta',
  target: 'General',

  appliesTo: (ctx: RoutingContext) => true,

  schema: schemaDe(['sintomaticoRespiratorioTb', 'intervencionesSMyA']),

  promptFragment: fragmento('Consulta externa — variables generales', [
    'sintomaticoRespiratorioTb: 1 si la nota describe tos prolongada o sospecha de tuberculosis.',
    'intervencionesSMyA admite varios valores separados por "&" cuando se realizaron varias acciones.'
  ]),

  buildInputs: (_ctx, draft) => [
    select('sintomaticoRespiratorioTb', 'Probable tuberculosis pulmonar', cat.SI_NO, draft),
    // Declarada `Type.String()` en el record: GIIS la admite multivalor,
    // con varias claves unidas por "&".
    selectTexto('intervencionesSMyA', 'Intervenciones de salud mental y adicciones', cat.SI_NO, draft)
  ]
}
