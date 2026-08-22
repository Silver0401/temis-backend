/**
 * Backfill de `patients.clues` a partir de `users.patientsList` + `users.clues`.
 *
 * Contexto: el aislamiento por CLUES (hook scope-by-clues) filtra los pacientes
 * por `clues: { $in: <clues del médico> }`. Los pacientes creados antes de este
 * cambio NO tienen el campo `clues`, así que tras el deploy sus médicos dejarían
 * de verlos. Este script rellena `patients.clues` con la UNIÓN de las CLUES de
 * todos los médicos que ya tienen a ese paciente en su `patientsList`.
 *
 * Seguridad:
 *   - DRY-RUN por defecto: solo imprime lo que haría. Para escribir: `--apply`.
 *   - Idempotente: por defecto solo toca pacientes SIN clues o con clues vacío.
 *     Con `--overwrite` recalcula también los que ya tengan clues.
 *   - Reporta pacientes "huérfanos" (no están en el patientsList de ningún médico):
 *     esos quedan con clues = [] y ningún médico los verá hasta asignarlos a mano.
 *
 * Uso (desde la raíz del repo, reutiliza tu .env):
 *   env-cmd -f ./.env.prod node scripts/backfill-patient-clues.js            # dry-run
 *   env-cmd -f ./.env.prod node scripts/backfill-patient-clues.js --apply    # escribe
 *   env-cmd -f ./.env.prod node scripts/backfill-patient-clues.js --apply --overwrite
 *
 * Requiere NOT_MONGODB_URL en el entorno (misma var que usa la app).
 */
'use strict'

const { MongoClient, ObjectId } = require('mongodb')

const APPLY = process.argv.includes('--apply')
const OVERWRITE = process.argv.includes('--overwrite')

const normalizeClues = (value) => {
  if (Array.isArray(value)) {
    return value.filter((c) => typeof c === 'string' && c.trim().length > 0)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value]
  }
  return []
}

const idStr = (v) => {
  try {
    return v instanceof ObjectId ? v.toHexString() : String(v)
  } catch {
    return String(v)
  }
}

async function main() {
  const uri = process.env.NOT_MONGODB_URL
  if (!uri) {
    console.error('ERROR: falta NOT_MONGODB_URL en el entorno. Corre con env-cmd -f ./.env.prod ...')
    process.exit(1)
  }

  const dbName = new URL(uri).pathname.substring(1)
  const client = await MongoClient.connect(uri)
  const db = client.db(dbName)
  const usersCol = db.collection('users')
  const patientsCol = db.collection('patients')

  console.log(`\n== Backfill patients.clues ==`)
  console.log(`DB: ${dbName}`)
  console.log(`Modo: ${APPLY ? 'APPLY (escribe)' : 'DRY-RUN (no escribe)'}${OVERWRITE ? ' + OVERWRITE' : ''}\n`)

  // 1. Mapa patientId -> Set(clues) a partir de los patientsList de cada médico.
  const patientClues = new Map()
  const users = await usersCol
    .find({}, { projection: { clues: 1, patientsList: 1 } })
    .toArray()

  for (const u of users) {
    const clues = normalizeClues(u.clues)
    if (clues.length === 0) continue
    for (const pid of u.patientsList || []) {
      const key = idStr(pid)
      if (!patientClues.has(key)) patientClues.set(key, new Set())
      const set = patientClues.get(key)
      for (const c of clues) set.add(c)
    }
  }

  console.log(`Médicos con CLUES: ${users.filter((u) => normalizeClues(u.clues).length).length}/${users.length}`)
  console.log(`Pacientes referenciados en algún patientsList: ${patientClues.size}\n`)

  // 2. Recorre pacientes y calcula el cambio.
  const patients = await patientsCol.find({}, { projection: { clues: 1 } }).toArray()

  let toUpdate = 0
  let skipped = 0
  let orphans = 0
  const ops = []

  for (const p of patients) {
    const key = idStr(p._id)
    const current = normalizeClues(p.clues)
    const derived = Array.from(patientClues.get(key) || [])

    const hasClues = current.length > 0
    if (hasClues && !OVERWRITE) {
      skipped++
      continue
    }

    if (derived.length === 0) {
      // No aparece en el patientsList de ningún médico con CLUES.
      orphans++
      // Aún así fijamos el campo a [] para que exista (deny por defecto),
      // solo si no tenía nada; con overwrite no lo vaciamos si ya tenía.
      if (!hasClues) {
        ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: { clues: [] } } } })
        toUpdate++
      }
      continue
    }

    ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: { clues: derived } } } })
    toUpdate++
  }

  console.log(`Pacientes totales: ${patients.length}`)
  console.log(`A actualizar: ${toUpdate}`)
  console.log(`Sin cambio (ya tenían clues): ${skipped}`)
  console.log(`HUÉRFANOS (ningún médico los tiene → clues=[]): ${orphans}`)
  if (orphans > 0) {
    console.log(`  ⚠ Esos pacientes no serán visibles para ningún médico hasta asignarles CLUES a mano.`)
  }

  if (!APPLY) {
    console.log(`\nDRY-RUN: no se escribió nada. Repite con --apply para aplicar.\n`)
    await client.close()
    return
  }

  if (ops.length > 0) {
    const res = await patientsCol.bulkWrite(ops, { ordered: false })
    console.log(`\nAPLICADO. Documentos modificados: ${res.modifiedCount}\n`)
  } else {
    console.log(`\nNada que aplicar.\n`)
  }

  await client.close()
}

main().catch((err) => {
  console.error('Backfill falló:', err)
  process.exit(1)
})
