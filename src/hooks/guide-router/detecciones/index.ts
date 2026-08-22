/**
 * Sub-router de Detecciones — GIIS-B019-04-09.
 *
 * B019 no tiene una sección de "validaciones adicionales" como B018: los
 * criterios viven POR VARIABLE en el diccionario de datos. Por eso cada hoja
 * lleva su propio gate, y el sub-router sólo decide si la guía entra en juego.
 *
 * Nota: la guía NO define un grupo de detecciones de embarazo. Los tamizajes
 * ligados a gestación viven en Consulta Externa (campos 52-76).
 */
import type { GuideNode, RoutingContext } from '../types'
import { detBaseNode } from './det-base'
import { saludMentalNode } from './salud-mental'
import { geriatriaFuncionalNode } from './geriatria-funcional'
import { cronicasNode } from './cronicas'
import { adiccionesNode } from './adicciones'
import { itsNode } from './its'
import { cancerNode } from './cancer'
import { violenciaNode } from './violencia'
import { prostataNode } from './prostata'
import { respiratorioNode } from './respiratorio'

/** Todas las hojas de DET, en el orden de campos de la guía. */
export const detectionNodes: GuideNode[] = [
  detBaseNode,
  saludMentalNode,
  geriatriaFuncionalNode,
  cronicasNode,
  adiccionesNode,
  itsNode,
  cancerNode,
  violenciaNode,
  prostataNode,
  respiratorioNode
]

/**
 * Resuelve qué hojas de Detecciones aplican.
 * Devuelve [] cuando ninguna variable de la guía es llenable: en ese caso no
 * se genera renglón DET y la guía no aparece en el formulario.
 */
export const resolveDetectionNodes = (ctx: RoutingContext): GuideNode[] => {
  const hojas = detectionNodes.filter((n) => n.code !== 'DET.BASE' && n.appliesTo(ctx))
  return hojas.length > 0 ? [detBaseNode, ...hojas] : []
}
