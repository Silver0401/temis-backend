/// <reference types="mocha" />

import assert from 'assert'
import { DemoService } from '../../src/services/demo/demo.class'

describe('demo service', () => {
  const service = new DemoService()

  it('returns the AI response shape', async () => {
    const result: any = await service.create({ kind: 'ai', payload: {} })

    assert.deepStrictEqual(Object.keys(result), ['data'])
    assert.deepStrictEqual(Object.keys(result.data), ['completion'])
    assert.deepStrictEqual(Object.keys(result.data.completion).sort(), [
      'choices',
      'created',
      'id',
      'model',
      'object',
      'output_text',
      'system_fingerprint',
      'usage'
    ])
    assert.strictEqual(typeof result.data.completion.choices[0].message.content, 'string')
  })

  it('returns the synthesized record shape', async () => {
    const result: any = await service.create({ kind: 'synthesize', payload: {} })

    assert.deepStrictEqual(Object.keys(result).sort(), [
      'clinicalVariableCatalog',
      'clinicalVariablesDraft',
      'consultationType',
      'pendingPatientData',
      'record'
    ])
    assert.strictEqual(result.pendingPatientData.personalInfo.names, 'María Elena')
  })
})
