/**
 * Planificación Familiar — GIIS-B018-04-09. Hoja única, sin sub-ramas.
 *
 * Gate duro de la guía (sección Validaciones Adicionales, p. 34):
 *   sexoBiologico 1 o 3 → edad de 10 a 70 años
 *   sexoBiologico 2     → edad de 10 a 59 años
 * Fuera de ese rango NO existe renglón CPF.
 *
 * Ojo con la semántica mixta de los métodos: los hormonales y de barrera llevan
 * la CANTIDAD entregada (0 = no entregado), mientras implantes, DIU y
 * quirúrgico usan -1 = no aplica. Confundirlas hace que SINBA rechace el
 * archivo.
 */
import { edadEntre, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, numero, fragmento } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/** Rango de edad permitido por B018 según sexo biológico. */
export const edadPermitidaCPF = (ctx: RoutingContext): boolean => {
  if (esSexo(ctx, 2)) return edadEntre(ctx, 10, 59)
  if (esSexo(ctx, 1, 3)) return edadEntre(ctx, 10, 70)
  return false
}

/** Métodos que se reportan como cantidad entregada. */
const METODOS_CANTIDAD: Array<[string, string]> = [
  ['oral', 'Anticonceptivo oral (piezas)'],
  ['inyectableMensual', 'Inyectable mensual (piezas)'],
  ['inyectableBimestral', 'Inyectable bimestral (piezas)'],
  ['inyectableTrimestral', 'Inyectable trimestral (piezas)'],
  ['parcheDermico', 'Parche dérmico (piezas)'],
  ['preservativo', 'Preservativo (piezas)'],
  ['preservativoFemenino', 'Preservativo femenino (piezas)'],
  ['otroMetodo', 'Otro método (piezas)'],
  ['anticoncepcionEmergencia', 'Anticoncepción de emergencia (piezas)']
]

/** Métodos que se reportan con catálogo, usando -1 como no aplica. */
const METODOS_CATALOGO: Array<[string, string]> = [
  ['implanteSubdermico1Var', 'Implante subdérmico de 1 varilla'],
  ['implanteSubdermico2Var', 'Implante subdérmico de 2 varillas'],
  ['diu', 'DIU'],
  ['diuMedicado', 'DIU medicado'],
  ['quirurgico', 'Método quirúrgico']
]

export const planificacionFamiliarNode: GuideNode = {
  code: 'CPF',
  guide: 'CPF',
  label: 'Planificación familiar',
  target: 'FamilyPlanning',

  appliesTo: (ctx) =>
    edadPermitidaCPF(ctx) &&
    (ctx.aiFlags.planificacionFamiliar === true || ctx.aiFlags.consejeriaSSRA === true),

  schema: schemaDe([
    'puerperaAceptaPF',
    ...METODOS_CANTIDAD.map(([n]) => n),
    ...METODOS_CATALOGO.map(([n]) => n),
    'altaConAzoospermia',
    'OycPlanificacionF',
    'OycPrevencionITS',
    'OycPrevencionEmb',
    'OycOtrasSSRA'
  ]),

  promptFragment: fragmento('Planificación familiar', [
    'Los métodos hormonales y de barrera (oral, inyectables, parche, preservativos, emergencia, otro) se reportan como CANTIDAD entregada; 0 si no se entregó nada.',
    'Los métodos de larga duración y definitivos (implantes, DIU, DIU medicado, quirúrgico) usan -1 cuando no aplican.',
    'altaConAzoospermia sólo aplica a pacientes de sexo biológico hombre.',
    'Las cuatro variables de orientación y consejería usan 1 = SÍ cuando la consejería se brindó durante la atención.',
    'puerperaAceptaPF indica que una puérpera aceptó un método al egreso.'
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('puerperaAceptaPF', 'Puérpera que acepta método', cat.SI_NO, draft),
      ...METODOS_CANTIDAD.map(([n, l]) => numero(n, l, draft, { min: 0, max: 999 })),
      ...METODOS_CATALOGO.map(([n, l]) => select(n, l, cat.SI_NO, draft)),
      select('altaConAzoospermia', 'Alta con azoospermia', cat.SI_NO, draft),
      select('OycPlanificacionF', 'Consejería en planificación familiar', cat.SI_NO, draft),
      select('OycPrevencionITS', 'Consejería en prevención de ITS', cat.SI_NO, draft),
      select('OycPrevencionEmb', 'Consejería en prevención del embarazo', cat.SI_NO, draft),
      select('OycOtrasSSRA', 'Consejería en otras acciones de SSRA', cat.SI_NO, draft)
    ]
}
