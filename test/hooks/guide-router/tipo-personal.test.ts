/// <reference types="mocha" />
import assert from 'node:assert/strict'

import { mapTipoPersonal } from '../../../src/hooks/guide-router/context'

const TIPOS_PERSONAL = [
  ['MÉDICA(O) PASANTE', 1],
  ['MÉDICA(O) GENERAL', 2],
  ['MÉDICA(O) RESIDENTE', 3],
  ['MÉDICA(O) ESPECIALISTA', 4],
  ['PASANTE DE ENFERMERÍA', 5],
  ['ENFERMERA(O)', 6],
  ['PASANTE EN ODONTOLOGÍA', 12],
  ['ODONTÓLOGA (O)', 13],
  ['ODONTÓLOGA (O) ESPECIALISTA', 14],
  ['TÉCNICA(O) EN ODONTOLOGÍA', 23]
] as const

describe('mapTipoPersonal', () => {
  it('resuelve las diez etiquetas reales del registro', () => {
    for (const [etiqueta, codigo] of TIPOS_PERSONAL) {
      assert.equal(mapTipoPersonal(etiqueta), codigo)
    }
  })

  it('resuelve los cuatro tipos odontologicos oficiales', () => {
    assert.deepEqual(
      TIPOS_PERSONAL.slice(6).map(([etiqueta]) => mapTipoPersonal(etiqueta)),
      [12, 13, 14, 23]
    )
  })
})
