import { edadMin, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Salud del niño — GIIS-B015-04-11.
 * Gate: edad < 18 o la IA detecta atención pediátrica.
 */
export const pediatriaNode: GuideNode = {
  code: 'CEX.PEDIATRIA',
  guide: 'CEX',
  label: 'Salud del niño',
  target: 'Pediatrics',

  appliesTo: (ctx: RoutingContext) => (ctx.edad !== null && ctx.edad < 18) || ctx.aiFlags.pediatria === true,

  schema: schemaDe(['ninoSanoRT', 'pruebaEDI', 'resultadoEDI', 'resultadoBattelle', 'edasRT', 'edasPlanTratamiento', 'recuperadoDeshidratacion', 'numeroSobresVSOTratamiento', 'irasRT', 'irasPlanTratamiento', 'neumoniaRT', 'aplicacionCedulaCancer', 'informaPrevencionAccidentes']),

  promptFragment: fragmento('Consulta externa — salud del niño', [
    'La prueba EDI aplica a menores de 6 años; Battelle de 16 meses a 4 años.',
    'numeroSobresVSOTratamiento es una CANTIDAD, 0 si no se entregaron sobres.',
    'informaPrevencionAccidentes aplica a madres de menores de 10 años.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('ninoSanoRT', 'Consulta de niño sano', cat.RELACION_TEMPORAL, draft),
      select('pruebaEDI', 'Tipo de aplicación de prueba EDI', cat.SI_NO, draft),
      select('resultadoEDI', 'Resultado de la prueba EDI', cat.SI_NO, draft),
      select('resultadoBattelle', 'Resultado de la prueba Battelle', cat.SI_NO, draft),
      select('edasRT', 'Enfermedad diarreica aguda', cat.RELACION_TEMPORAL, draft),
      select('edasPlanTratamiento', 'Plan de tratamiento de EDA', cat.SI_NO, draft),
      select('recuperadoDeshidratacion', 'Recuperado de deshidratación', cat.SI_NO, draft),
      select('numeroSobresVSOTratamiento', 'Sobres de Vida Suero Oral como tratamiento', cat.SI_NO, draft),
      select('irasRT', 'Infección respiratoria aguda', cat.RELACION_TEMPORAL, draft),
      select('irasPlanTratamiento', 'Plan de tratamiento de IRA', cat.SI_NO, draft),
      select('neumoniaRT', 'Neumonía', cat.RELACION_TEMPORAL, draft),
      select('aplicacionCedulaCancer', 'Cédula de detección de cáncer en menores de 18', cat.SI_NO, draft),
      select('informaPrevencionAccidentes', 'Se informó sobre prevención de accidentes', cat.SI_NO, draft),
    ]
}
