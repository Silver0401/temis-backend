// Migración del vínculo enfermería → médico de singular a plural.
//
// Antes: `tutorId` (un solo médico) + `patientsList` plano.
// Ahora:  `tutorIds[]` + `teamAssignments[{ tutorId, patientIds[] }]`, con
//         `patientsList` como unión derivada.
//
// El código lee las dos formas (ver hooks/generic/team-tutors.ts), así que las
// cuentas viejas funcionan SIN correr esto. Este script solo normaliza los
// documentos para dejar de depender del camino legacy.
//
// NO SE HA EJECUTADO. Temis y Cronos comparten cluster de MongoDB: correrlo sin
// revisar a qué base apunta el .env es destructivo. Pásale --apply a propósito;
// sin la bandera solo reporta qué haría.
//
// Uso:
//   npx env-cmd -f ./.env.dev ts-node src/scripts/backfill-team-assignments.ts
//   npx env-cmd -f ./.env.dev ts-node src/scripts/backfill-team-assignments.ts --apply
import { app } from '../app'

const apply = process.argv.includes('--apply')

const run = async () => {
  const users = app.service('users')
  const result: any = await users.find({
    provider: undefined,
    paginate: false,
    query: { role: 'enfermeria' }
  } as any)
  const members: any[] = Array.isArray(result) ? result : (result?.data ?? [])

  let migrated = 0
  let skipped = 0

  for (const member of members) {
    const alreadyPlural = Array.isArray(member.tutorIds) && member.tutorIds.length
    const alreadyMapped = Array.isArray(member.teamAssignments) && member.teamAssignments.length
    if (alreadyPlural && alreadyMapped) {
      skipped += 1
      continue
    }
    const tutorId = member.tutorIds?.[0] ?? member.tutorId
    if (!tutorId) {
      console.warn(`- ${member.email}: sin tutor, se omite`)
      skipped += 1
      continue
    }
    const patientIds = (member.patientsList ?? []).map(String)
    const patch = {
      tutorIds: [String(tutorId)],
      teamAssignments: [{ tutorId: String(tutorId), patientIds }],
      patientsList: patientIds
    }
    console.log(
      `${apply ? 'MIGRA' : 'SIMULA'} ${member.email}: tutor ${tutorId}, ${patientIds.length} paciente(s)`
    )
    if (apply) await users.patch(member._id, patch as any, { provider: undefined })
    migrated += 1
  }

  console.log(`\n${apply ? 'Migradas' : 'Por migrar'}: ${migrated}. Sin cambios: ${skipped}.`)
  if (!apply) console.log('Nada se escribió. Vuelve a correrlo con --apply para aplicarlo.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
