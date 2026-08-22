import assert from 'assert'
import { ObjectId } from 'mongodb'

import { ConsentSignService } from '../../../src/services/consent-sign/consent-sign.class'
import { ConsentsService } from '../../../src/services/consents/consents.class'

const same = (left: unknown, right: unknown) => String(left) === String(right)

const matches = (doc: Record<string, any>, filter: Record<string, any>) =>
  Object.entries(filter).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && '$gte' in expected) {
      return doc[key] >= expected.$gte
    }
    return same(doc[key], expected)
  })

describe('consents flow', () => {
  it('emits, reads publicly, signs once and exposes the signed evidence to its doctor', async () => {
    const doctorId = new ObjectId()
    const patientId = new ObjectId()
    const consentRows: Record<string, any>[] = []
    const auditRows: Array<{ data: Record<string, any>; params: Record<string, any> }> = []

    const consentsCollection = {
      async insertOne(doc: Record<string, any>) {
        const insertedId = new ObjectId()
        consentRows.push({ ...doc, _id: insertedId })
        return { insertedId }
      },
      find(filter: Record<string, any>) {
        return {
          sort() {
            return {
              async toArray() {
                return consentRows
                  .filter((row) => matches(row, filter))
                  .sort((a, b) => b.createdAt - a.createdAt)
              }
            }
          }
        }
      },
      async findOne(filter: Record<string, any>) {
        return consentRows.find((row) => matches(row, filter)) ?? null
      },
      async findOneAndUpdate(filter: Record<string, any>, update: { $set: Record<string, any> }) {
        const row = consentRows.find((candidate) => matches(candidate, filter))
        if (!row) return null
        Object.assign(row, update.$set)
        return row
      },
      async updateOne() {
        return { modifiedCount: 1 }
      }
    }

    const db = {
      collection(name: string) {
        if (name === 'consents') return consentsCollection
        if (name === 'users') {
          return {
            async findOne(filter: Record<string, any>) {
              return same(filter._id, doctorId) ? { _id: doctorId, name: 'Ana Médica' } : null
            }
          }
        }
        throw new Error(`Unexpected collection ${name}`)
      }
    }

    const app = {
      get(name: string) {
        if (name === 'mongodbClient') return Promise.resolve(db)
        throw new Error(`Unexpected setting ${name}`)
      },
      service(name: string) {
        if (name === 'patients') {
          return {
            async get(id: string) {
              return {
                data: {
                  patientsList: same(id, patientId)
                    ? [
                        {
                          _id: patientId,
                          clues: ['NLSSA000001'],
                          personalInfo: {
                            names: 'María',
                            middleName: 'López',
                            lastName: 'García'
                          }
                        }
                      ]
                    : []
                }
              }
            }
          }
        }
        if (name === 'logs') {
          return {
            async create(data: Record<string, any>, params: Record<string, any>) {
              auditRows.push({ data, params })
              return data
            }
          }
        }
        throw new Error(`Unexpected service ${name}`)
      }
    } as any

    const consents = new ConsentsService({ app })
    const publicSigning = new ConsentSignService({ app })
    const doctorParams = {
      user: { _id: doctorId, name: 'Ana Médica', clues: ['NLSSA000001'] }
    } as any

    const issued = await consents.create(
      { templateId: 'generic-medical-consent', patientId: String(patientId) },
      doctorParams
    )
    assert.strictEqual(issued.status, 'pending')
    assert.strictEqual(issued.patientName, 'María López García')

    const publicDocument = await publicSigning.get(issued.token)
    assert.strictEqual(publicDocument.doctorName, 'Ana Médica')
    assert.strictEqual(publicDocument.docHash, issued.docHash)

    const signed = await publicSigning.create(
      { token: issued.token, mode: 'acceptance', signerName: 'María López García' },
      {
        provider: 'rest',
        headers: { 'x-forwarded-for': '203.0.113.10', 'user-agent': 'consents-test' }
      } as any
    )
    assert.strictEqual(signed.status, 'signed')

    await assert.rejects(
      () =>
        publicSigning.create(
          { token: issued.token, mode: 'acceptance', signerName: 'María López García' },
          {} as any
        ),
      /Link inválido o expirado/
    )

    const doctorList = await consents.find({
      ...doctorParams,
      query: { patientId: String(patientId) }
    })
    assert.strictEqual(doctorList.length, 1)
    assert.strictEqual(doctorList[0].status, 'signed')
    assert.strictEqual(doctorList[0].signerName, 'María López García')
    assert.strictEqual(auditRows.length, 1)
    assert.strictEqual(auditRows[0].data.sessionRef, issued.docHash)
    assert.strictEqual(auditRows[0].params.headers.host, '203.0.113.10')
  })
})
