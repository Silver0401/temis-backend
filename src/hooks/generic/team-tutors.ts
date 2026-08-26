// Utilidades del vínculo enfermería → médico.
//
// El vínculo nació singular (`tutorId`) y se volvió plural (`tutorIds`), porque
// una enfermera atiende normalmente a uno o dos médicos. Las cuentas viejas
// siguen trayendo `tutorId` suelto, así que TODA lectura pasa por aquí y
// normaliza, igual que `normalizeClues` hace con `clues`.
//
// La autoridad de qué pacientes le asignó cada médico es `teamAssignments`
// (indexado por tutor). `patientsList` se conserva como unión derivada porque
// medio backend ya la lee, pero no manda: se recalcula siempre con
// `unionAssignedPatients`. Un solo lugar la calcula a propósito; si dos
// divergieran, el alcance quedaría mal sin que nada avise.

export type TeamAssignment = { tutorId: string; patientIds: string[] }
export type TeamInviteStatus = 'pending' | 'accepted' | 'rejected'
export type TeamInvite = { tutorId: string; status: TeamInviteStatus; createdAt: string }

const toId = (value: unknown) => String(value)

/** Tutores de la cuenta.
 *
 *  `tutorIds` MANDA en cuanto existe, aunque venga vacío: en cuanto la cuenta
 *  toca el camino plural, el `tutorId` viejo deja de contar. Si se sumaran los
 *  dos, sacar a una enfermera del equipo no la sacaría — el resolver de `users`
 *  omite los campos `undefined`, así que `tutorId` no se puede borrar con un
 *  patch, y el vínculo viejo reviviría al normalizar. */
export const normalizeTutorIds = (user: any): string[] => {
  if (Array.isArray(user?.tutorIds)) return [...new Set(user.tutorIds.map(toId))] as string[]
  return user?.tutorId ? [toId(user.tutorId)] : []
}

export const isTutorOf = (user: any, tutorId: unknown): boolean =>
  normalizeTutorIds(user).includes(toId(tutorId))

/** Asignaciones normalizadas. Una cuenta legacy sin el campo deriva su única
 *  rebanada del `patientsList` plano que ya tenía. */
export const normalizeAssignments = (user: any): TeamAssignment[] => {
  // Igual que arriba: si el campo plural existe, manda aunque esté vacío.
  if (Array.isArray(user?.teamAssignments)) {
    return user.teamAssignments.map((assignment: any) => ({
      tutorId: toId(assignment?.tutorId),
      patientIds: (assignment?.patientIds ?? []).map(toId)
    }))
  }
  const tutors = normalizeTutorIds(user)
  if (tutors.length !== 1) return []
  return [{ tutorId: tutors[0], patientIds: (user?.patientsList ?? []).map(toId) }]
}

/** Pacientes que ESE médico le asignó. Nunca los de otro. */
export const assignedByTutor = (user: any, tutorId: unknown): string[] =>
  normalizeAssignments(user).find((assignment) => assignment.tutorId === toId(tutorId))?.patientIds ??
  []

/** Reemplaza la rebanada de un tutor dejando intactas las de los demás. */
export const withTutorAssignment = (
  user: any,
  tutorId: unknown,
  patientIds: unknown[]
): TeamAssignment[] => {
  const id = toId(tutorId)
  const next = normalizeAssignments(user).filter((assignment) => assignment.tutorId !== id)
  next.push({ tutorId: id, patientIds: [...new Set(patientIds.map(toId))] })
  return next
}

/** Único cálculo de la unión. Todo escritor de `patientsList` llama aquí. */
export const unionAssignedPatients = (assignments: TeamAssignment[]): string[] => [
  ...new Set(assignments.flatMap((assignment) => assignment.patientIds))
]

export const normalizeInvites = (user: any): TeamInvite[] =>
  Array.isArray(user?.teamInvites)
    ? user.teamInvites.map((invite: any) => ({
        tutorId: toId(invite?.tutorId),
        status: (invite?.status ?? 'pending') as TeamInviteStatus,
        createdAt: String(invite?.createdAt ?? '')
      }))
    : []
