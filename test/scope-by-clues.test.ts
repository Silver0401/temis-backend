import assert from 'assert'
import { cluesIntersect, normalizeClues } from '../src/hooks/generic/scope-by-clues'

describe('scope by CLUES', () => {
  it('normalizes catalog labels to their CLUES code', () => {
    assert.deepStrictEqual(normalizeClues(['NLSSA004162 - C.S.U. HIDALGO']), ['NLSSA004162'])
    assert.ok(cluesIntersect(['NLSSA004162 - C.S.U. HIDALGO'], ['NLSSA004162']))
  })
})
