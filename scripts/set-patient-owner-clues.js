/**
 * Asigna NLSSA004162 a los usuarios que ya tienen pacientes en patientsList.
 *
 * Uso:
 *   env-cmd -f ./.env.dev node scripts/set-patient-owner-clues.js
 *   env-cmd -f ./.env.dev node scripts/set-patient-owner-clues.js --apply
 */
'use strict'

const { MongoClient } = require('mongodb')

const CLUES = 'NLSSA004162'
const APPLY = process.argv.includes('--apply')

async function main() {
  const uri = process.env.NOT_MONGODB_URL
  if (!uri) throw new Error('Falta NOT_MONGODB_URL en el entorno')

  const client = await MongoClient.connect(uri)

  try {
    const db = client.db(new URL(uri).pathname.substring(1))
    const users = db.collection('users')
    const owners = { 'patientsList.0': { $exists: true } }
    const pending = { ...owners, clues: { $ne: [CLUES] } }

    console.log(`DB: ${db.databaseName}`)
    console.log(`CLUES: ${CLUES}`)
    console.log(`Usuarios con pacientes: ${await users.countDocuments(owners)}`)
    console.log(`Usuarios por actualizar: ${await users.countDocuments(pending)}`)

    if (!APPLY) {
      console.log('DRY-RUN: no se escribieron datos. Usa --apply para aplicar.')
      return
    }

    const result = await users.updateMany(owners, { $set: { clues: [CLUES] } })
    console.log(`Usuarios modificados: ${result.modifiedCount}`)
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
