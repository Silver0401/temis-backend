// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('catalogo-dxcie-10 service', () => {
  it('registered the service', () => {
    const service = app.service('catalogo-dxcie-10')

    assert.ok(service, 'Registered the service')
  })
})
