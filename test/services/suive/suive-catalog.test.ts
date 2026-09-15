import assert from 'node:assert'

import { suiveCatalog } from '../../../src/services/suive/suive.catalog'

describe('SUIVE catalog', () => {
  it('contains the complete validated XLSX extraction', () => {
    const entries = Object.values(suiveCatalog)
    assert.strictEqual(entries.length, 184)
    assert.strictEqual(new Set(entries.map((entry) => entry.epiClave)).size, 184)
    assert.strictEqual(new Set(entries.map((entry) => entry.grupo)).size, 18)
  })

  it('preserves markers, exclusions, decimal ranges and S/C', () => {
    assert.deepStrictEqual(suiveCatalog[44].incluye, [{ tipo: 'exacto', clave: 'A170' }])
    assert.strictEqual(suiveCatalog[44].notificacionInmediata, true)
    assert.deepStrictEqual(suiveCatalog[8].excluye, [{ tipo: 'exacto', clave: 'A080' }])
    assert.deepStrictEqual(suiveCatalog[178].incluye, [
      { tipo: 'rango', desde: 'A011', hasta: 'A014' }
    ])
    assert.deepStrictEqual(suiveCatalog[181].incluye, [])
    assert.strictEqual(suiveCatalog[181].estudioEpidemiologico, true)
    assert.strictEqual(suiveCatalog[181].estudioBrote, true)
  })
})
