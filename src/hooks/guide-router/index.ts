/**
 * ROUTER INICIAL — el punto pivote de Temis.
 *
 * Embudo en tres tiempos:
 *   1. Gates deterministas (edad, sexo, tipoPersonal, CLUES) descartan de
 *      entrada las guías imposibles. Nunca se le pregunta a la IA por algo que
 *      la guía ya resolvió con un número.
 *   2. Una sola llamada a la IA clasifica la nota clínica: qué pasó en la
 *      consulta (embarazo, pediatría, anticoncepción, tamizajes) y prellena
 *      las variables de las hojas que quedaron vivas.
 *   3. Se vuelven a aplicar los gates sobre lo que devolvió la IA, y el embudo
 *      de salida funde todos los inputs en un solo formulario.
 */
import { GeneralError } from '@feathersjs/errors'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { HookContext } from '../../declarations'
import { esSintesis } from '../records/synthesize-preview'
import { sanitizeForAI } from '../../json/Generator'
import { buildRoutingContext } from './context'
import { resolveConsultaExternaNodes } from './consulta-externa'
import { resolveDetectionNodes } from './detecciones'
import { planificacionFamiliarNode, edadPermitidaCPF } from './planificacion-familiar'
import { mergeInputList, calcularSteps, agruparPorTarget, mapFieldTargets, mapFieldTypes } from './merge'
import type { GuideCode, GuideNode, RoutingContext, RoutingResult } from './types'

const openai = new OpenAI({ apiKey: process.env.NOT_OPEN_AI_KEY })

/**
 * Señales clínicas que SÍ le tocan a la IA. Son interpretaciones de la nota,
 * no datos duros: la edad y el sexo jamás se preguntan aquí.
 */
const FlagsSchema = z
  .object({
    embarazo: z.boolean(),
    saludReproductiva: z.boolean(),
    pediatria: z.boolean(),
    geriatria: z.boolean(),
    planificacionFamiliar: z.boolean(),
    consejeriaSSRA: z.boolean(),
    detecciones: z.boolean()
  })
  .strict()

const PROMPT_FLAGS = `
Eres un médico que clasifica notas clínicas para el reporte NOM-024/GIIS de una unidad de salud pública.

Marca true SÓLO si la nota lo documenta:
- embarazo: atención pregestacional, control prenatal, embarazo, parto o puerperio.
- saludReproductiva: menopausia, ITS, patología mamaria, colposcopía o cáncer ginecológico.
- pediatria: atención centrada en menor de edad (niño sano, EDA, IRA, neumonía, tamiz del desarrollo).
- geriatria: valoración o intervención gerontológica.
- planificacionFamiliar: se entregó, revisó o retiró un método anticonceptivo.
- consejeriaSSRA: se brindó orientación o consejería en planificación familiar, prevención de ITS o de embarazo.
- detecciones: se realizó cualquier tamizaje o prueba de detección (crónicas, adicciones, ITS, cáncer, violencia, salud mental, espirometría).

No infieras por la edad ni el sexo del paciente: eso ya lo resuelve el sistema.
`

/** Paso 1: gates deterministas. Qué hojas son posibles antes de leer la nota. */
export const hojasPosibles = (ctx: RoutingContext): GuideNode[] => {
  const permisivo: RoutingContext = {
    ...ctx,
    aiFlags: {
      embarazo: true,
      saludReproductiva: true,
      pediatria: true,
      geriatria: true,
      planificacionFamiliar: true,
      consejeriaSSRA: true,
      detecciones: true
    }
  }
  return [
    ...resolveConsultaExternaNodes(permisivo),
    ...resolveDetectionNodes(permisivo),
    ...(edadPermitidaCPF(ctx) ? [planificacionFamiliarNode] : [])
  ]
}

/** Paso 3: hojas definitivas, ya con las señales de la IA aplicadas. */
export const hojasActivas = (ctx: RoutingContext): GuideNode[] => [
  ...resolveConsultaExternaNodes(ctx),
  ...(ctx.aiFlags.detecciones === true ? resolveDetectionNodes(ctx) : []),
  ...(planificacionFamiliarNode.appliesTo(ctx) ? [planificacionFamiliarNode] : [])
]

/**
 * PASO 4 del alta: decide qué guías aplican y arma el formulario que el médico
 * va a confirmar.
 *
 * Solo corre en modo síntesis. Antes corría también al confirmar —dos llamadas
 * a la IA por alta— y además volcaba el borrador dentro del record, así que las
 * variables de Detecciones, Planificación Familiar y Administrativas se
 * guardaban tal como las dedujo el modelo, sin que ningún médico las viera. El
 * borrador ahora solo viaja al formulario; lo que se persiste es lo que el
 * médico confirma.
 */
export const guideRouter = async (context: HookContext): Promise<HookContext> => {
  // Al confirmar ya no hay nada que rutear: el médico manda los valores que
  // revisó en el formulario.
  if (!esSintesis(context)) {
    // El catálogo trae 20 columnas por diagnóstico y no se persiste, pero es la
    // única fuente del `Diagnosis` que sí va al record: el formulario manda
    // `diagnosisCatalog` y nadie lo convertía, así que los records quedaban sin
    // diagnóstico y el tablero salía vacío.
    const catalogo = (context.data as any)?.diagnosisCatalog
    if (Array.isArray(catalogo) && catalogo.length && !(context.data as any).Diagnosis?.length) {
      ;(context.data as any).Diagnosis = catalogo.map((cie: any) => ({
        id: String(cie?.CATALOG_KEY ?? ''),
        Name: String(cie?.NOMBRE ?? ''),
        CIE: String(cie?.CATALOG_KEY ?? ''),
        Confirmed: false
      }))
    }
    delete (context.data as any).diagnosisCatalog
    return context
  }

  const ctx = buildRoutingContext(context)

  // El catálogo CIE viaja solo para rutear: ya está copiado en `ctx`, y en el
  // record persiste `Diagnosis`, no las 20 columnas del catálogo por cada nota.
  delete (context.data as any).diagnosisCatalog

  if (!context.data?.ClinicalHistory) return context
  const posibles = hojasPosibles(ctx)

  // Schema dinámico: sólo se le pide a la IA lo que puede aplicar.
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const node of posibles) {
    Object.assign(shape, (node.schema as any).shape ?? {})
  }

  const Respuesta = z.object({ flags: FlagsSchema, variables: z.object(shape).partial() }).strict()

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: `${PROMPT_FLAGS}\n\nReglas de extracción por bloque:\n${posibles
          .map((n) => n.promptFragment)
          .join(
            '\n\n'
          )}\n\nUsa null cuando el texto no permita llenar una variable con seguridad. No inventes valores para completar formularios.`
      },
      { role: 'user', content: `Historia clínica:\n${sanitizeForAI(context.data.ClinicalHistory)}` }
    ],
    response_format: zodResponseFormat(Respuesta, 'Ruteo_Guias_GIIS')
  })

  if (completion.choices[0].message.refusal) {
    throw new GeneralError(`Error ${completion.choices[0].message.refusal}`)
  }

  const parsed = completion.choices[0].message.parsed
  if (!parsed) return context

  console.log(parsed)

  ctx.aiFlags = parsed.flags as unknown as Record<string, boolean>

  const activas = hojasActivas(ctx)
  const draft = agruparPorTarget(activas, parsed.variables as Record<string, unknown>)

  const applicableGuides = [...new Set(activas.map((n) => n.guide))] as GuideCode[]
  const inputList = mergeInputList(activas, ctx, draft)
  const resultado: RoutingResult = {
    applicableGuides,
    activeNodes: activas.map((n) => n.code),
    draft,
    inputList,
    fieldTargets: mapFieldTargets(activas, ctx, draft),
    fieldTypes: mapFieldTypes(activas, ctx, draft),
    steps: calcularSteps(inputList.length)
  }

  ;(context.params as any).routing = resultado

  return context
}
