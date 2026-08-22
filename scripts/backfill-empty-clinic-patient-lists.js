/**
 * Agrega los pacientes NLSSA004162 a usuarios de esa clinica con patientsList vacio.
 *
 * Uso:
 *   env-cmd -f ./.env.dev node scripts/backfill-empty-clinic-patient-lists.js
 *   env-cmd -f ./.env.dev node scripts/backfill-empty-clinic-patient-lists.js --apply
 */
'use strict'

const { MongoClient } = require('mongodb')

const CLUES = 'NLSSA004162'
const APPLY = process.argv.includes('--apply')
const normalize = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().split(/\s+-\s+/, 1)[0].toUpperCase())

async function main() {
  const uri = process.env.NOT_MONGODB_URL
  if (!uri) throw new Error('Falta NOT_MONGODB_URL en el entorno')

  const client = await MongoClient.connect(uri)

  try {
    const db = client.db(new URL(uri).pathname.substring(1))
    const patients = await db.collection('patients').find({ clues: CLUES }, { projection: { _id: 1 } }).toArray()
    const users = await db
      .collection('users')
      .find({ $or: [{ patientsList: { $exists: false } }, { patientsList: { $size: 0 } }] })
      .toArray()
    const candidates = users.filter((user) => normalize(user.clues).includes(CLUES))

    console.log(`DB: ${db.databaseName}`)
    console.log(`Pacientes de ${CLUES}: ${patients.length}`)
    console.log(`Usuarios de la clinica con lista vacia: ${candidates.length}`)

    if (!APPLY) {
      console.log('DRY-RUN: no se escribieron datos. Usa --apply para aplicar.')
      return
    }

    if (candidates.length) {
      const result = await db.collection('users').bulkWrite(
        candidates.map((user) => ({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { clues: [CLUES], patientsList: patients.map((patient) => patient._id) } }
          }
        }))
      )
      console.log(`Usuarios modificados: ${result.modifiedCount}`)
    }
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
