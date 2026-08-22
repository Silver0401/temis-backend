// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { SomasService } from './somas.class'

/**
 * Un parámetro somatométrico. `null` significa NO MEDIDO — no es lo mismo que
 * cero, que en varios de estos campos sería una medición imposible.
 */
const medicion = () => Type.Union([Type.Number(), Type.Null()])

/**
 * Los parámetros son SIEMPRE los mismos trece: no hay campos libres ni un
 * arreglo de longitud variable. Antes se guardaba `values[]` repitiendo en cada
 * documento el nombre, la abreviatura y la unidad de cada parámetro —el
 * diccionario duplicado en cada medición—, más un `baseText` con la misma
 * información concatenada en una frase. Ahora el documento guarda números y el
 * diccionario vive una sola vez, en el catálogo.
 */
export const somasValuesSchema = Type.Object(
  {
    peso: medicion(),
    talla: medicion(),
    imc: medicion(),
    circAbdominal: medicion(),
    sistolica: medicion(),
    diastolica: medicion(),
    frecuenciaCardiaca: medicion(),
    frecuenciaRespiratoria: medicion(),
    temperatura: medicion(),
    saturacionOxigeno: medicion(),
    glucemia: medicion(),
    /** Catálogo GIIS: 1 AYUNO · 2 CASUAL. */
    glucemiaTipo: medicion(),
    /** Catálogo GIIS: 1 LABORATORIO · 2 TIRA REACTIVA. */
    glucemiaObtenida: medicion()
  },
  { additionalProperties: false }
)
export type SomasValues = Static<typeof somasValuesSchema>

// Main data model schema
export const somasSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    patientId: ObjectIdSchema(),
    recordId: Type.Optional(ObjectIdSchema()),
    dateTaken: Type.String(),
    values: somasValuesSchema
  },
  { $id: 'Somas', additionalProperties: false }
)
export type Somas = Static<typeof somasSchema>
export const somasValidator = getValidator(somasSchema, dataValidator)
export const somasResolver = resolve<Somas, HookContext<SomasService>>({})

export const somasExternalResolver = resolve<Somas, HookContext<SomasService>>({})

// Schema for creating new entries (patientId optional so validate-only calls can omit it)
export const somasDataSchema = Type.Object(
  {
    dateTaken: Type.String(),
    patientId: Type.Optional(ObjectIdSchema()),
    recordId: Type.Optional(ObjectIdSchema()),
    // El formulario manda los trece parámetros como texto: es lo que escribió
    // el médico, sin convertir. `build_somas_from_values` los valida y los
    // normaliza a número antes de guardar.
    //
    // El tipo admite número y null además de texto. Exigir texto puro hacía que
    // una sola clave ajena al catálogo tumbara el alta completa con
    // "/values/<clave> must be string", aunque el hook ni siquiera la lee: solo
    // recorre las claves de `CAMPOS`. Lo que se persiste lo sigue fijando
    // `somasSchema` (número o null en los trece parámetros), así que aflojar el
    // transporte no afloja el documento.
    values: Type.Record(Type.String(), Type.Union([Type.String(), Type.Number(), Type.Null()]))
  },
  { $id: 'SomasData', additionalProperties: false }
)

export type SomasData = Static<typeof somasDataSchema>
export const somasDataValidator = getValidator(somasDataSchema, dataValidator)
export const somasDataResolver = resolve<Somas, HookContext<SomasService>>({})

// Schema for updating existing entries
export const somasPatchSchema = Type.Partial(somasSchema, {
  $id: 'SomasPatch'
})
export type SomasPatch = Static<typeof somasPatchSchema>
export const somasPatchValidator = getValidator(somasPatchSchema, dataValidator)
export const somasPatchResolver = resolve<Somas, HookContext<SomasService>>({})

// Schema for allowed query properties
export const somasQueryProperties = Type.Pick(somasSchema, ['_id', 'dateTaken', 'patientId', 'recordId'])
export const somasQuerySchema = Type.Intersect(
  [
    querySyntax(somasQueryProperties),
    // Add additional query properties here
    Type.Object({ validateOnly: Type.Optional(Type.Boolean()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type SomasQuery = Static<typeof somasQuerySchema>
export const somasQueryValidator = getValidator(somasQuerySchema, queryValidator)
export const somasQueryResolver = resolve<SomasQuery, HookContext<SomasService>>({})
