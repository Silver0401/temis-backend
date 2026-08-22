/**
 * Sub-router de Consulta Externa — GIIS-B015-04-11.
 *
 * CEX es la guía base: siempre se genera un renglón. Se divide en las tres
 * ramas por tipo de paciente (embarazo, pediatría, geriatría) más la cabecera
 * general y el bloque administrativo, que aplican siempre.
 */
import type { GuideNode, RoutingContext } from '../types'
import { cexBaseNode } from './cex-base'
import { embarazoNode } from './embarazo'
import { pediatriaNode } from './pediatria'
import { geriatriaNode } from './geriatria'
import { administrativasNode } from './administrativas'

export const consultaExternaNodes: GuideNode[] = [
  cexBaseNode,
  embarazoNode,
  pediatriaNode,
  geriatriaNode,
  administrativasNode
]

/** CEX siempre aplica; sólo varían las ramas por tipo de paciente. */
export const resolveConsultaExternaNodes = (ctx: RoutingContext): GuideNode[] =>
  consultaExternaNodes.filter((n) => n.appliesTo(ctx))
