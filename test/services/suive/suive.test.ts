import assert from 'node:assert'
import { ObjectId } from 'mongodb'

import { SuiveService } from '../../../src/services/suive/suive.class'

const ownId = new ObjectId().toHexString()
const foreignId = new ObjectId().toHexString()
const recordId = ObjectId.createFromTime(Math.floor(Date.UTC(2026, 0, 15) / 1000))

const makeService = (catalogRows: Record<string, unknown>[] = []) => {
  const patientCalls: string[] = []
  const app = {
    get(name: string) {
      if (name !== 'mongodbClient') throw new Error(`Unexpected setting ${name}`)
      return Promise.resolve({
        collection(collectionName: string) {
          assert.strictEqual(collectionName, 'catalogo-dxcie-10')
          return {
            find() {
              return { async toArray() { return catalogRows } }
            }
          }
        }
      })
    },
    service(name: string) {
      if (name === 'patients') {
        return {
          async get(id: string) {
            patientCalls.push(id)
            return {
              data: {
                patientsList: [
                  {
                    _id: id,
                    personalInfo: {
                      names: 'María',
                      middleName: 'López',
                      lastName: 'García',
                      birthDate: '2000-02-20',
                      sex: 'Femenino'
                    }
                  }
                ]
              }
            }
          }
        }
      }
      if (name === 'records') {
        return {
          async find() {
            return {
              data: [
                {
                  _id: recordId,
                  Diagnosis: [{ CIE: 'A17.0', Name: 'Meningitis', Confirmed: true }]
                }
              ]
            }
          }
        }
      }
      throw new Error(`Unexpected service ${name}`)
    }
  } as any
  return { service: new SuiveService({ app }), patientCalls }
}

const catalog = [
  { CATALOG_KEY: 'A170', NOMBRE: 'MENINGITIS TUBERCULOSA', ES_SUIVE_MORB: 'SI', EPI_CLAVE: 44 }
]

describe('suive service', () => {
  it('allows an admin to review any requested patient', async () => {
    const { service } = makeService(catalog)
    const result = await service.create(
      { patientIds: [foreignId] },
      { user: { role: 'admin', patientsList: [] } } as any
    )

    assert.strictEqual(result.totalCasos, 1)
    assert.strictEqual(result.casos[0].epiClave, 44)
    assert.strictEqual(result.casos[0].fechaConsulta, '15/01/2026')
    assert.strictEqual(result.casos[0].edad, 25)
  })

  it('intersects a doctor request with their patientsList', async () => {
    const { service, patientCalls } = makeService(catalog)
    const result = await service.create(
      { patientIds: [ownId, foreignId] },
      { user: { role: 'medico', patientsList: [ownId] } } as any
    )

    assert.deepStrictEqual(patientCalls, [ownId])
    assert.deepStrictEqual(result.omitidos, [{ patientId: foreignId, reason: 'Fuera de tu alcance' }])
    assert.strictEqual(result.totalCasos, 1)
  })

  it('uses the tutor-scoped patientsList prepared for nursing', async () => {
    const { service, patientCalls } = makeService(catalog)
    const result = await service.create(
      { patientIds: [foreignId, ownId] },
      { user: { role: 'enfermeria', patientsList: [ownId] } } as any
    )

    assert.deepStrictEqual(patientCalls, [ownId])
    assert.strictEqual(result.omitidos[0].reason, 'Fuera de tu alcance')
    assert.strictEqual(result.totalCasos, 1)
  })

  it('reports XLSX gaps and invalid EPI values without inventing cases', async () => {
    const { service } = makeService([
      { CATALOG_KEY: 'A170', NOMBRE: 'Nombre de Mongo', ES_SUIVE_MORB: 'SI', EPI_CLAVE: 31 }
    ])
    const outsideXlsx = await service.create(
      { patientIds: [ownId] },
      { user: { role: 'medico', patientsList: [ownId] } } as any
    )
    assert.strictEqual(outsideXlsx.casos[0].diagnosticoSuive, 'Nombre de Mongo')
    assert.strictEqual(outsideXlsx.casos[0].grupo, 'Sin grupo en catálogo SUIVE')
    assert.strictEqual(outsideXlsx.avisos.length, 1)

    const invalid = makeService([
      { CATALOG_KEY: 'A170', NOMBRE: 'Nombre de Mongo', ES_SUIVE_MORB: 'SI', EPI_CLAVE: 'NO' }
    ])
    const withoutEpi = await invalid.service.create(
      { patientIds: [ownId] },
      { user: { role: 'medico', patientsList: [ownId] } } as any
    )
    assert.strictEqual(withoutEpi.totalCasos, 0)
    assert.match(withoutEpi.avisos[0], /sin clave EPI numérica/)
  })
})
