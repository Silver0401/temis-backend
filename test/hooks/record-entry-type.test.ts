import { strict as assert } from 'assert'
import { recordEntryType } from '../../src/services/records/records.schema'

describe('recordEntryType', () => {
  it('abre historia para los cinco tipos de primera vez', () => {
    const base = { patientId: 'patient', Temporality: 'PrimeraVez' }
    const cases = [
      { Pediatrics: { ninoSanoRT: 0 } },
      { diagnosisCatalog: [{ DIA_CRONICOS: '1' }] },
      { Gynecology: { relacionTemporalEmbarazo: 0 } },
      { Gynecology: { puerpera: 0 } },
      { FamilyPlanning: { oral: 0 } }
    ]

    cases.forEach((record) =>
      assert.equal(recordEntryType({ ...base, ...record }), 'ClinicalHistoryInit')
    )
  })

  it('conserva como evolución una atención subsecuente', () => {
    assert.equal(
      recordEntryType({
        patientId: 'patient',
        Temporality: 'Subsecuente',
        Pediatrics: { ninoSanoRT: 0 }
      }),
      'EvolutionNote'
    )
  })
})
