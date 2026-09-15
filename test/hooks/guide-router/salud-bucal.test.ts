/// <reference types="mocha" />
import assert from 'node:assert/strict'

process.env.NOT_OPEN_AI_KEY ??= 'test'

import type { GuideNode, RoutingContext } from '../../../src/hooks/guide-router/types'

const { buildRoutingContext, esOdontologo } = require('../../../src/hooks/guide-router/context')
const { hojasActivas, hojasPosibles } = require('../../../src/hooks/guide-router')
const { saludBucalNode } = require('../../../src/hooks/guide-router/salud-bucal')
const { userDataResolver } = require('../../../src/services/users/users.schema')

const contextoReal = async (
  professionType: string,
  overrides: Partial<RoutingContext> = {}
): Promise<RoutingContext> => {
  const role = await userDataResolver.resolveProperty(
    'role',
    { professionType },
    { params: {} } as any
  )
  const ctx = buildRoutingContext({
    params: {
      user: { role, professionType, clues: ['TEST0000000'] },
      patientData: { personalInfo: { birthDate: '01/01/2000', sex: 'Masculino' } }
    },
    data: { ClinicalHistory: '', diagnosisCatalog: [] }
  } as any)
  return { ...ctx, ...overrides }
}

describe('guide-router salud bucal', () => {
  it('reconoce el rol derivado y las cuentas legacy por professionType', async () => {
    const registrado = await contextoReal('ODONTÓLOGA (O)')
    const legacy = buildRoutingContext({
      params: {
        user: { professionType: 'PASANTE EN ODONTOLOGÍA', clues: ['TEST0000000'] },
        patientData: { personalInfo: { birthDate: '01/01/2000', sex: 'Masculino' } }
      },
      data: { ClinicalHistory: '', diagnosisCatalog: [] }
    } as any)
    const medico = await contextoReal('MÉDICA(O) GENERAL')

    assert.equal(registrado.role, 'odontologo')
    assert.equal(registrado.tipoPersonal, 13)
    assert.equal(esOdontologo(registrado), true)
    assert.equal(legacy.tipoPersonal, 12)
    assert.equal(esOdontologo(legacy), true)
    assert.equal(esOdontologo(medico), false)
  })

  it('hace exclusiva la hoja CSB antes y despues de la IA', async () => {
    const ctx = await contextoReal('ODONTÓLOGA (O)', { aiFlags: { detecciones: true } })
    assert.deepEqual(hojasPosibles(ctx).map((node: GuideNode) => node.code), ['CSB'])
    assert.deepEqual(hojasActivas(ctx).map((node: GuideNode) => node.code), ['CSB'])
  })

  it('conserva el flujo CEX para el medico', async () => {
    const ctx = await contextoReal('MÉDICA(O) GENERAL')
    assert.equal(hojasPosibles(ctx).some((node: GuideNode) => node.guide === 'CEX'), true)
    assert.equal(hojasActivas(ctx).some((node: GuideNode) => node.guide === 'CEX'), true)
    assert.equal(hojasActivas(ctx).some((node: GuideNode) => node.guide === 'CSB'), false)
  })

  it('construye los 25 campos dentales con sus rangos oficiales', async () => {
    const ctx = await contextoReal('ODONTÓLOGA (O)')
    const inputs = saludBucalNode.buildInputs(ctx, {}) as Array<{
      identifier: string
      validations?: { min: number; max: number }
    }>
    assert.equal(inputs.length, 25)
    assert.deepEqual(inputs.find((input) => input.identifier === 'amalgamas')?.validations, {
      min: 0,
      max: 32
    })
    assert.deepEqual(inputs.find((input) => input.identifier === 'dienteTemp')?.validations, {
      min: 0,
      max: 9
    })
  })
})
