import * as cat from '../catalogs'
import { schemaDe, select, fragmento } from '../shared'
import type { GuideNode } from '../types'

/**
 * Cabecera de Detecciones — GIIS-B019-04-09 campos 37, 38 y 92.
 * Aplica siempre que se genere un renglón DET.
 */
export const detBaseNode: GuideNode = {
  code: 'DET.BASE',
  guide: 'DET',
  label: 'Datos generales de la detección',
  target: 'Detections',

  appliesTo: () => true,

  schema: schemaDe(['tirasDeteccion']),

  promptFragment: fragmento('Detecciones — datos generales', [
    'tirasDeteccion es la CANTIDAD de tiras reactivas usadas en la detección; 0 si no se usó ninguna.'
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('tirasDeteccion', 'Tiras reactivas utilizadas', cat.SI_NO, draft)
    ]
}
