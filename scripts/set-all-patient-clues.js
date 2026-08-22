/**
 * Asigna la CLUES NLSSA004162 a todos los pacientes.
 *
 * Uso:
 *   env-cmd -f ./.env.prod node scripts/set-all-patient-clues.js
 *   env-cmd -f ./.env.prod node scripts/set-all-patient-clues.js --apply
 */
'use strict'

const { MongoClient } = require('mongodb')

const CLUES = 'NLSSA004162'
const APPLY = process.argv.includes('--apply')

if (!/^[A-Z0-9]{11}$/.test(CLUES)) {
  throw new Error(`CLUES invalida: ${CLUES}`)
}

async function main() {
  const uri = process.env.NOT_MONGODB_URL
  if (!uri) throw new Error('Falta NOT_MONGODB_URL en el entorno')

  const dbName = new URL(uri).pathname.substring(1)
  const client = await MongoClient.connect(uri)

  try {
    const patients = client.db(dbName).collection('patients')
    const total = await patients.countDocuments()
    const pending = await patients.countDocuments({ clues: { $ne: [CLUES] } })

    console.log(`DB: ${dbName}`)
    console.log(`CLUES: ${CLUES}`)
    console.log(`Pacientes totales: ${total}`)
    console.log(`Pacientes por actualizar: ${pending}`)

    if (!APPLY) {
      console.log('DRY-RUN: no se escribieron datos. Usa --apply para aplicar.')
      return
    }

    const result = await patients.updateMany({}, { $set: { clues: [CLUES] } })
    console.log(`Pacientes modificados: ${result.modifiedCount}`)
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
