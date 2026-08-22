// Alta de la cuenta de administrador de plataforma.
//
// El rol `admin` no se puede crear por registro publico (el resolver de
// `users` fuerza `medico`) ni desde `medical-team` (solo da de alta
// `enfermeria`). Esta es la unica via.
//
// Uso:
//   npx env-cmd -f ./.env.dev ts-node src/scripts/seed-admin.ts <email> <password> "<nombre>"
//
// Si el correo ya existe, se limita a promoverlo a `admin`.
import { app } from '../app'

const [, , emailArg, passwordArg, ...nameParts] = process.argv

const run = async () => {
  const email = (emailArg ?? '').trim().toLowerCase()
  const password = passwordArg ?? ''
  const name = nameParts.join(' ').trim() || 'Administrador'

  if (!email || !password) {
    throw new Error('Uso: ts-node src/scripts/seed-admin.ts <email> <password> "<nombre>"')
  }
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres')

  const users = app.service('users')
  const existing: any = await users.find({ provider: undefined, paginate: false, query: { email } } as any)
  const found = (Array.isArray(existing) ? existing : (existing?.data ?? []))[0]

  const target =
    found ??
    (await users.create(
      {
        name,
        email,
        password,
        clues: [],
        medicalLicenses: [],
        professionType: 'ADMINISTRACIÓN',
        UID: { type: 'managed', frontImg: '', reverseImg: '', faceImg: '' }
      } as any,
      { provider: undefined, internalSeed: true }
    ))

  // El rol solo se puede fijar en un patch interno (userPatchResolver).
  // Solo el rol: `tutorId` y `teamAccessStatus` ya están ausentes en un usuario
  // recién creado, y mandarlos como `undefined` los persistiría como `null`,
  // que no valida contra `Type.Optional(...)`.
  const admin: any = await users.patch(target._id, { role: 'admin' } as any, {
    provider: undefined
  })

  console.log(`Cuenta admin lista: ${admin.email} (${admin._id})`)
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error?.message ?? error)
    process.exit(1)
  })
