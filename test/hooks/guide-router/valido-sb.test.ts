/// <reference types="mocha" />
import assert from 'node:assert/strict'
import { BadRequest } from '@feathersjs/errors'

import { cieDiagnosticValidator } from '../../../src/hooks/records/cie-diagnostic-validator'
import { userDataResolver } from '../../../src/services/users/users.schema'

const contextWith = async (professionType: string, validoSB: string | number) => {
  const role = await userDataResolver.resolveProperty(
    'role',
    { professionType },
    { params: {} } as any
  )
  return {
    data: {
      Diagnosis: [{ CIE: 'K003', Name: 'Diagnóstico dental', Confirmed: false }],
      Temporality: 'Subsecuente'
    },
    params: {
      user: { role, professionType },
      patientData: { personalInfo: { birthDate: '01/01/2000', sex: 'Masculino' } }
    },
    app: {
      service: () => ({
        find: async () => [{ CATALOG_KEY: 'K003', LSEX: 'NO', LINF: 'NO', LSUP: 'NO', VALIDO_SB: validoSB }]
      })
    }
  } as any
}

describe('VALIDO_SB', () => {
  it('acepta listas separadas por comas y valores numericos', async () => {
    await cieDiagnosticValidator(await contextWith('ODONTÓLOGA (O)', '12,13,14,23'))
    await cieDiagnosticValidator(await contextWith('ODONTÓLOGA (O) ESPECIALISTA', 14))
  })

  it('rechaza un diagnostico no habilitado para salud bucal', async () => {
    await assert.rejects(
      async () => cieDiagnosticValidator(await contextWith('ODONTÓLOGA (O)', 'NO')),
      (error: unknown) => error instanceof BadRequest
    )
  })
})
