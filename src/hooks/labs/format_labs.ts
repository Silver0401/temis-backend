import type { HookContext } from '../../declarations'
import OpenAI from 'openai'
import z from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { BadRequest, GeneralError } from '@feathersjs/errors'
import { LabBaseParameters } from '../../json/Constants'

const openai = new OpenAI({ apiKey: process.env.NOT_OPEN_AI_KEY })

const LAB_CATALOG_LIST = Object.values(LabBaseParameters)
  .map((lab) => `${lab.name} / ${lab.fullName} / ${lab.abbreviation} (unidad: ${lab.unit})`)
  .join(' | ')

// Portado de Cronos (2026-09-15). Si el alta ya trae `values` estructurados
// (flujos de paciente temporal), no se llama a la IA.
export const format_labs = async (context: HookContext) => {
  const { data } = context

  if (!data?.baseText) {
    if (Array.isArray(data?.values) && data.values.length > 0) return context
    throw new BadRequest('Faltan los resultados de laboratorio')
  }

  const ExtractJSONFormat = z
    .object({
      labs: z.array(
        z.object({
          fullName: z.string(),
          abreviation: z.string(),
          unit: z.string(),
          value: z.string()
        })
      )
    })
    .strict()

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: `
          Eres un organizador de información. Te voy a pasar un texto con los resultados de laboratorio de un paciente, tu trabajo es regresar una lista de objetos en JSON de TODOS los resultados de laboratorio que encuentres con la siguiente estructura:

            {
              "labs": [
              {
                fullName: "Nombre completo del Estudio de Laboratorio",
                abreviation: "Abreviación del Estudio de Laboratorio",
                unit: "Unidad de medida del laboratorio",
                value: "24.7"
              }
            ]
          }

          Instrucciones para llenar el JSON:
          - El campo **value** siempre debe de tener todos los decimales del texto

          ⚠️ Reglas estrictas:
          - No repitas estudios de laboratorio
          - Te voy a proporcionar el siguiente catálogo de laboratorios conocidos: ${LAB_CATALOG_LIST}. Cada entrada tiene el formato: Nombre / NombreCompleto / Abreviación (unidad: Unidad), y cada entrada está separada por |. Si alguno de los labs que encontraste en el texto corresponde a alguna entrada de este catálogo (por nombre, abreviación o sinónimo), usa EXACTAMENTE el fullName, abreviation y unit de esa entrada. Si el laboratorio NO está en el catálogo, agrégalo de todas formas pero tú defines el fullName, abreviation y unit.
          `
      },
      {
        role: 'user',
        content: `Aqui esta el texto: ${data.baseText}`
      }
    ],
    response_format: zodResponseFormat(ExtractJSONFormat, 'Laboratorios_Encontrados')
  })

  let finalLabsArray: any[] = []

  if (completion.choices[0].message.refusal) {
    console.log(completion.choices[0].message.refusal)
    throw new GeneralError(completion.choices[0].message.refusal)
  } else {
    const labsFound = completion.choices[0].message.parsed?.labs

    if (labsFound && labsFound?.length > 0) {
      finalLabsArray = labsFound
    } else {
      throw new GeneralError('No se encontraron resultados de laboratorio que extraer')
    }
  }

  delete context.data.baseText

  context.data = {
    ...context.data,
    values: finalLabsArray
  }

  return context
}
