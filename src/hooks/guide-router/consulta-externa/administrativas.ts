import { edadMin, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Datos administrativos de la atención — GIIS-B015-04-11.
 * Gate: siempre. Son obligatorias en sector público.
 */
export const administrativasNode: GuideNode = {
  code: 'CEX.ADMIN',
  guide: 'CEX',
  label: 'Datos administrativos de la atención',
  target: 'Administrativas',

  appliesTo: (ctx: RoutingContext) => true,

  schema: schemaDe(['primeraVezUneme', 'numeroSobresVSOPromocion', 'lineaVida', 'cartillaSalud', 'esquemaVacunacion', 'referidoPor', 'contrarreferido', 'telemedicina', 'teleconsulta', 'estudiosTeleconsulta', 'modalidadConsulDist']),

  promptFragment: fragmento('Consulta externa — datos administrativos', [
    'Estas variables son obligatorias para sector público y rara vez se deducen de la nota clínica: usa null salvo que el texto las mencione, y el médico las completará en el formulario.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('primeraVezUneme', 'Caso en seguimiento en UNEME', cat.SI_NO, draft),
      select('numeroSobresVSOPromocion', 'Sobres de Vida Suero Oral en promoción', cat.SI_NO, draft),
      select('lineaVida', 'Se aplicó Línea de Vida', cat.SI_NO, draft),
      select('cartillaSalud', 'Se revisó la Cartilla Nacional de Salud', cat.SI_NO, draft),
      select('esquemaVacunacion', 'Esquema de vacunación completo', cat.SI_NO, draft),
      select('referidoPor', 'Referido por', cat.SI_NO, draft),
      select('contrarreferido', 'Contrarreferido', cat.SI_NO, draft),
      select('telemedicina', 'Atención por telemedicina', cat.SI_NO, draft),
      select('teleconsulta', 'Atención por teleconsulta', cat.SI_NO, draft),
      select('estudiosTeleconsulta', 'Estudios solicitados en teleconsulta', cat.SI_NO, draft),
      select('modalidadConsulDist', 'Modalidad de consulta a distancia', cat.SI_NO, draft),
    ]
}
