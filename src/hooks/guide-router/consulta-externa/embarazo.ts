import { edadMin, esSexo } from '../context'
import * as cat from '../catalogs'
import { schemaDe, select, fragmento } from '../shared'
import type { GuideNode, RoutingContext } from '../types'

/**
 * Salud reproductiva, embarazo y puerperio — GIIS-B015-04-11.
 * Gate: sexo 2 o 3, y la IA detecta atención pregestacional, embarazo, puerperio o salud reproductiva femenina.
 */
export const embarazoNode: GuideNode = {
  code: 'CEX.EMBARAZO',
  guide: 'CEX',
  label: 'Salud reproductiva, embarazo y puerperio',
  target: 'Gynecology',

  appliesTo: (ctx: RoutingContext) => esSexo(ctx, 2, 3) && (ctx.aiFlags.embarazo === true || ctx.aiFlags.saludReproductiva === true),

  schema: schemaDe(['atencionPregestacionalRT', 'relacionTemporalEmbarazo', 'planSeguridad', 'trimestreGestacional', 'primeraVezAltoRiesgo', 'complicacionPorDiabetes', 'complicacionPorInfeccionUrinaria', 'complicacionPorPreeclampsiaEclampsia', 'complicacionPorHemorragia', 'embarazadaSinDiabetes', 'sospechaCovid19', 'hipertensionarterialprexistente', 'otrasAccPrescAcidoFolico', 'otrasAccApoyoTraslado', 'otrasACCApoyoTrasladoAME', 'puerpera', 'infeccionPuerperal', 'terapiaHormonal', 'periPostMenopausia', 'its', 'patologiaMamariaBenigna', 'cancerMamario', 'colposcopia', 'cancerCervicouterino']),

  promptFragment: fragmento('Consulta externa — salud reproductiva', [
    'trimestreGestacional usa 1, 2 o 3; puede inferirse de las semanas de gestación si la nota las menciona.',
    'Relación temporal: 0 = primera vez, 1 = subsecuente.',
    'No marques complicaciones que la nota no documente.',
  ]),

  buildInputs: (_ctx, draft) =>
    [
      select('atencionPregestacionalRT', 'Atención pregestacional', cat.RELACION_TEMPORAL, draft),
      select('relacionTemporalEmbarazo', 'Relación temporal del embarazo', cat.RELACION_TEMPORAL, draft),
      select('planSeguridad', 'Entrega o refuerzo del plan de seguridad', cat.SI_NO, draft),
      select('trimestreGestacional', 'Trimestre gestacional', cat.SI_NO, draft),
      select('primeraVezAltoRiesgo', 'Primera vez con alto riesgo', cat.SI_NO, draft),
      select('complicacionPorDiabetes', 'Complicación por diabetes', cat.SI_NO, draft),
      select('complicacionPorInfeccionUrinaria', 'Complicación por infección urinaria', cat.SI_NO, draft),
      select('complicacionPorPreeclampsiaEclampsia', 'Complicación por preeclampsia o eclampsia', cat.SI_NO, draft),
      select('complicacionPorHemorragia', 'Complicación por hemorragia', cat.SI_NO, draft),
      select('embarazadaSinDiabetes', 'Tiras usadas en embarazada sin diabetes', cat.SI_NO, draft),
      select('sospechaCovid19', 'Sospecha de COVID-19', cat.SI_NO, draft),
      select('hipertensionarterialprexistente', 'Hipertensión arterial preexistente', cat.SI_NO, draft),
      select('otrasAccPrescAcidoFolico', 'Prescripción de ácido fólico', cat.SI_NO, draft),
      select('otrasAccApoyoTraslado', 'Apoyo de traslado obstétrico', cat.SI_NO, draft),
      select('otrasACCApoyoTrasladoAME', 'Apoyo de transporte AME', cat.SI_NO, draft),
      select('puerpera', 'Es puérpera', cat.RELACION_TEMPORAL, draft),
      select('infeccionPuerperal', 'Infección puerperal', cat.RELACION_TEMPORAL, draft),
      select('terapiaHormonal', 'Primera vez con terapia hormonal', cat.SI_NO, draft),
      select('periPostMenopausia', 'Consulta por peri o postmenopausia', cat.SI_NO, draft),
      select('its', 'Consulta por infección de transmisión sexual', cat.SI_NO, draft),
      select('patologiaMamariaBenigna', 'Patología mamaria benigna', cat.SI_NO, draft),
      select('cancerMamario', 'Consulta por cáncer mamario', cat.SI_NO, draft),
      select('colposcopia', 'Se realizó colposcopía', cat.SI_NO, draft),
      select('cancerCervicouterino', 'Consulta por cáncer cervicouterino', cat.SI_NO, draft),
    ]
}
