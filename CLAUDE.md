# Contexto Global — MyBrain

> Al iniciar sesión en este proyecto, leer los siguientes archivos para cargar el contexto completo del usuario y sus skills antes de comenzar cualquier tarea.

**CLAUDE.md principal (vault):**
`/Users/ismaelmc/Library/Mobile Documents/iCloud~md~obsidian/Documents/MyBrain/CLAUDE.md`

**Skills activas para este proyecto:**
- `/Users/ismaelmc/Library/Mobile Documents/iCloud~md~obsidian/Documents/MyBrain/00-Sistema/Skills/Senior Backend`
- `/Users/ismaelmc/Library/Mobile Documents/iCloud~md~obsidian/Documents/MyBrain/00-Sistema/Skills/Senior FullStack`

**Nota de proyecto en Obsidian:**
`/Users/ismaelmc/Library/Mobile Documents/iCloud~md~obsidian/Documents/MyBrain/04-Proyectos/CronosMD/Backend/CronosBackend.md`

---

# CronosMD — Backend

EHR de nueva generación para Latinoamérica. Este backend expone una API REST + WebSockets construida con FeathersJS sobre Koa.

**Repositorio:** `/Users/ismaelmc/Documents/cronos-backend`
**Nota Obsidian:** `MyBrain/04-Proyectos/CronosMD/Backend/CronosBackend.md`

---

## Stack

- **Runtime:** Node.js ≥22.2 + TypeScript
- **Framework:** FeathersJS 5 con Koa
- **Base de datos:** MongoDB (`src/mongodb.ts`)
- **Transporte:** REST + WebSockets via Socket.io
- **Schema / Validación:** TypeBox (Feathers) + Zod
- **Auth:** Feathers authentication — local + OAuth (`src/authentication.ts`)
- **Storage:** AWS S3 + Cloudinary (`src/hooks/bucket/`)
- **AI:** OpenAI SDK (`src/services/ai/`)
- **OCR:** Tesseract.js (`src/services/transcriber/`)
- **PDF:** pdf-parse (`src/services/uploads/`)
- **Logger:** Winston (`src/logger.ts`)

---

## Estructura

```
src/
├── index.ts              # Entry point — arranca el servidor
├── app.ts                # Setup Koa + Feathers (middleware, transports, hooks globales)
├── mongodb.ts            # Conexión MongoDB
├── authentication.ts     # Configuración de auth
├── channels.ts           # WebSocket channels (presencia, rooms)
├── configuration.ts      # Validación de config con TypeBox
├── declarations.ts       # Tipos globales de la aplicación
├── validators.ts         # dataValidator / queryValidator (compartidos)
│
├── services/             # ← AQUÍ VIVE TODA LA LÓGICA DE NEGOCIO
│   ├── index.ts          # Registra todos los servicios en el app
│   ├── ai/               # Integración OpenAI (chat, análisis)
│   ├── agenda/           # Citas médicas
│   ├── patients/         # Pacientes
│   ├── records/          # Expedientes clínicos
│   ├── users/            # Usuarios (médicos)
│   ├── groups/           # Grupos / clínicas
│   ├── labs/             # Resultados de laboratorio
│   ├── drugs/            # Medicamentos
│   ├── somas/            # Somatometrías
│   ├── orders/           # Órdenes médicas
│   ├── imgs/             # Imágenes clínicas (S3/Cloudinary)
│   ├── maps/             # Mapas anatómicos
│   ├── logs/             # Auditoría de acciones
│   ├── template/         # Plantillas clínicas
│   ├── transcriber/      # Transcripción de audio (Tesseract + OpenAI)
│   ├── uploads/          # Subida de archivos (PDF, imágenes)
│   └── catalogs/         # Catálogos NOM-024 Cofepris (read-only)
│       ├── catalogo-afiliaciones/
│       ├── catalogo-dxcie-10/       # CIE-10
│       ├── catalogo-ent-fed/
│       ├── catalogo-establecimientos/
│       ├── catalogo-localidades/
│       ├── catalogo-municipios/
│       ├── catalogo-paises/
│       ├── catalogo-personal-type/
│       └── catalogo-serv-by-type/
│
├── hooks/                # Lifecycle hooks reutilizables
│   ├── bucket/           # save_img, delete_img, populate_img_url
│   ├── patients/         # populate-latest-record, update-user-patients, duplicate-analyzer
│   ├── records/          # record-router, hospital-ids-retriever, patient-diagnoser
│   ├── validations/      # curpPaciente, nombrePaciente, identificationParser
│   ├── groups/           # add_group_admin, populate_patients, update_user_groups
│   ├── logs/             # AddUserToLog
│   ├── maps/             # GenerateMap
│   ├── drugs/            # format_drugs
│   ├── labs/             # format_labs
│   ├── somas/            # format_somas
│   ├── users/            # check-user-identity
│   └── generic/          # log-error (hook global), tester
│
├── json/                 # Datos estáticos en TypeScript
│   ├── AnatomyParts.ts   # Partes anatómicas del modelo 3D
│   ├── Constants.ts      # Constantes globales
│   └── Generator.ts      # Generadores de datos
│
└── assets/               # Documentos de contexto para IA (NOM-024)
    ├── NOM024_Catalogos_Contexto_IA.md
    └── NOM024_Catalogos_MongoDB_Tutor_IA.md
```

---

## Patrón de un Servicio

Cada servicio vive en `src/services/[nombre]/` con exactamente 4 archivos:

| Archivo | Contenido |
|---|---|
| `[name].ts` | Registro del servicio en Feathers (configura hooks, autenticación, DB) |
| `[name].class.ts` | Clase que extiende `MongoDBService` — lógica de negocio |
| `[name].schema.ts` | Schemas TypeBox: main schema, data (create), patch (update), query |
| `[name].shared.ts` | Tipos y path compartidos entre cliente y servidor |

### Patrón de schema (TypeBox)

```ts
// Schema principal (modelo MongoDB)
export const xSchema = Type.Object({ _id: ObjectIdSchema(), ... })
export type X = Static<typeof xSchema>

// Para crear
export const xDataSchema = Type.Pick(xSchema, ['field1', 'field2'], { $id: 'XData' })

// Para actualizar (patch)
export const xPatchSchema = Type.Partial(xSchema, { $id: 'XPatch', additionalProperties: true })

// Para queries
export const xQuerySchema = Type.Intersect([querySyntax(xQueryProperties), Type.Object({...})])
```

### Agregar un nuevo servicio

1. Crear carpeta `src/services/[nombre]/` con los 4 archivos
2. Registrar en `src/services/index.ts`
3. El hook global `logError` ya aplica a todos los servicios (no re-agregarlo)

---

## API Layer

- **REST:** `http://localhost:[PORT]/[service-name]`
- **WebSocket:** via Socket.io — el cliente Feathers lo usa transparentemente
- **Auth header:** `Authorization: Bearer [JWT]`
- **Presencia de dispositivos:** gestionada en `src/app.ts` via `app.set('presence', ...)`

---

## Config y Variables de Entorno

- `.env.dev` — desarrollo local
- `.env.prod` — producción
- `config/default.json` — configuración base de Feathers (puerto, MongoDB URI, origins)
- `config/custom-environment-variables.json` — mapeo de env vars

---

## Scripts

```bash
npm run dev    # Desarrollo con hot reload (.env.dev)
npm run prod   # Producción con hot reload (.env.prod)
npm run build  # Compilar TS → lib/
npm start      # Ejecutar lib/ (post-build)
npm test       # Mocha tests
```
