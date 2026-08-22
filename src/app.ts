// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import { configurationValidator } from './configuration'
import favicon from 'koa-favicon'
import type { Application } from './declarations'
import { logError } from './hooks/generic/log-error'
import { mongodb } from './mongodb'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import socketio from '@feathersjs/socketio'
import path from 'path'

// --------------------- Socket Variables ---------------------

const app: Application = koa(feathers())
const mbSizeLimit = 30

app.set('presence', {} as Record<string, { userId: string; computer: boolean; phone: boolean }>)

// -------------------------------------------------------------

// Render App Icon
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware

// Cabeceras de seguridad básicas (sin dependencia; koa-helmet daría cobertura
// completa pero requiere instalar el paquete — ver informe A6).
app.use(async (ctx, next) => {
  ctx.set('X-Content-Type-Options', 'nosniff')
  ctx.set('X-Frame-Options', 'DENY')
  ctx.set('Referrer-Policy', 'no-referrer')
  ctx.set('X-DNS-Prefetch-Control', 'off')
  await next()
})

// Rate limiting en memoria para endpoints sensibles (SGSI-11: límite de intentos).
// Fixed-window por IP+path. Nota: es por-instancia; en despliegue multi-instancia
// hace falta un store compartido (p. ej. Redis) — ver informe A6.
const rateBuckets = new Map<string, { count: number; reset: number }>()
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 10

// Allowlist de paths públicos/sensibles con límite propio. Todo endpoint público
// nuevo debe registrarse aquí (max/windowMs opcionales, default 10 req / 60 s).
export const PUBLIC_RATE_LIMITED_PATHS: {
  path: string
  method?: string
  max?: number
  windowMs?: number
}[] = [
  { path: '/authentication' },
  { path: '/verify-nufi' },
  // Registro de médicos.
  { path: '/users', method: 'POST' },
  // Canje de link compartido: limita fuerza bruta de la contraseña.
  { path: '/record-redeem' },
  { path: '/demo', max: 20 },
  // Consulta y firma pública de consentimientos por token.
  { path: '/consent-sign' },
  // Alta de paciente desde el link/QR emitido por su médico.
  { path: '/external-patient-registration', method: 'POST' }
]

app.use(async (ctx, next) => {
  const rule = PUBLIC_RATE_LIMITED_PATHS.find(
    (r) =>
      (ctx.path === r.path || ctx.path.startsWith(`${r.path}/`)) &&
      (!r.method || ctx.method === r.method)
  )
  if (!rule) return next()

  const now = Date.now()
  const key = `${ctx.ip}:${rule.path}`
  const bucket = rateBuckets.get(key)
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(key, { count: 1, reset: now + (rule.windowMs ?? RATE_WINDOW_MS) })
  } else if (++bucket.count > (rule.max ?? RATE_MAX)) {
    ctx.status = 429
    ctx.body = { name: 'TooManyRequests', message: 'Demasiados intentos, espera un momento' }
    return
  }
  await next()
})

// CORS restringido a los orígenes permitidos (igual que el socket en :50-52),
// en vez de abrir a cualquier origen.
const allowedOrigins = (app.get('origins') as string[]) ?? []
app.use(
  cors({
    origin: (ctx) => {
      const reqOrigin = ctx.get('Origin')
      return allowedOrigins.includes(reqOrigin) ? reqOrigin : ''
    },
    credentials: true
  })
)
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(
  bodyParser({
    jsonLimit: `${mbSizeLimit}mb`,
    formLimit: `${mbSizeLimit}mb`,
    textLimit: `${mbSizeLimit}mb`
  })
)

// Configure services and transports

app.configure(rest())
app.configure(
  socketio(
    {
      cors: {
        origin: app.get('origins')
      },
      maxHttpBufferSize: mbSizeLimit * 1024 * 1024
    },
    (io) => {
      io.on('connection', (socket) => {
        socket.on('disconnect', async () => {
          // @ts-ignore
          const deviceType = socket.feathers.headers.devicetype
          // @ts-ignore
          const userId = socket.feathers.user._id as string
          // @ts-ignore
          const userStatus = socket.feathers.user.status
          // @ts-ignore
          const currentDevices = socket.feathers.user.status.devices as string[]

          const updatedDevices = [...currentDevices.filter((device) => device !== deviceType)]

          console.log(updatedDevices)

          await app.service('users').patch(userId, { status: { ...userStatus, devices: updatedDevices } })

          app.service('users').emit('devicesConnected', { devices: updatedDevices, userId: userId })

          console.log('Socket Logout', `user/${userId}, deviceType: ${deviceType}`)
        })
      })
    }
  )
)
app.configure(mongodb)
app.configure(authentication)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
