# Decisiones

## 2026-07-23 - Endpoint publico de alta externa

- Se usara un servicio separado `external-patient-registration` sin JWT y con metodo externo unico `create`; no se abrira el servicio `patients` existente.
- El payload tendra schema TypeBox cerrado (`additionalProperties: false`) y solo aceptara `doctorId`, identificacion, `hospitalIds` y localizacion.
- La clase validara que `doctorId` sea un ObjectId y corresponda a un usuario existente con CLUES; no devolvera datos del medico.
- La creacion reutilizara internamente `patients.create` con el usuario medico en params para conservar validacion GIIS, deteccion de duplicados, herencia de CLUES y actualizacion de `patientsList`.
- La ruta se agregara a `PUBLIC_RATE_LIMITED_PATHS`; el ID del medico solo sera una referencia de destino para crear, nunca una capacidad de consulta o modificacion.

## 2026-07-20 - Diagnostico de pacientes vacios en dashboard

- **Causa raiz:** el commit `1a937ea` agrego aislamiento por CLUES sin aplicar la migracion de los documentos existentes. `src/services/patients/patients.class.ts:43` construye `clues: { $in: normalizeClues(params.user?.clues) }` y `src/services/patients/patients.class.ts:52-53` lo agrega al `getRequest` usado por el dashboard. Los pacientes previos no tienen `clues`, por lo que MongoDB no los devuelve.
- **Capa afectada:** backend. El frontend sigue enviando correctamente `GET patients/getRequest` desde `src/app/dashboard/page.tsx:60-64` y consume `data.patientsList`; no hubo una regresion reciente en ese contrato.
- **Evidencia:** `scripts/backfill-patient-clues.js` documenta esta incompatibilidad en sus lineas 4-8. Su dry-run contra produccion reporto 1 paciente total, 1 por actualizar, 0 con `clues` y 0 huerfanos. No se escribieron datos.
- **Decision propuesta, aun no aplicada:** ejecutar primero el backfill en produccion con `--apply` para asignar al paciente historico la CLUES derivada de `users.patientsList`; despues verificar `GET /patients/getRequest`. No se debe retirar el filtro, porque protege el aislamiento entre establecimientos.
- **Prevencion propuesta:** agregar una prueba de integracion que cubra la migracion/visibilidad de pacientes previos y validar que todo usuario clinico tenga al menos una CLUES antes de crear pacientes, evitando documentos nuevos con `clues: []`.

## 2026-07-21 - CLUES unica para pacientes existentes

- Se decidio asignar `NLSSA004162` a todos los pacientes existentes para restaurar su visibilidad bajo el aislamiento por establecimiento.
- Se creo `scripts/set-all-patient-clues.js`, con dry-run por defecto y escritura explicita mediante `--apply`.
- La decision se aplico en produccion: 1 de 1 pacientes fue actualizado a `clues: ["NLSSA004162"]`; la verificacion posterior reporto 0 pendientes.
- La misma asignacion se aplico a la base `test`: 154 de 154 pacientes actualizados y 0 pendientes.

## 2026-07-21 - Normalizacion de CLUES de usuarios propietarios

- El dashboard seguia vacio porque `users.clues` contenia valores incompatibles con `patients.clues`: nulos o etiquetas como `NLSSA004162 - C.S.U. HIDALGO`, mientras los pacientes guardaban solo `NLSSA004162`.
- Se corrigio `normalizeClues` para extraer el codigo antes de ` - ` y compararlo en mayusculas. El cambio cubre consultas, permisos y creacion futura de pacientes.
- Para reparar inmediatamente el entorno `test` usado por Railway, se asigno `NLSSA004162` a los 10 usuarios que ya tenian pacientes en `patientsList`; no se tocaron usuarios sin pacientes.
- Se agrego `scripts/set-patient-owner-clues.js`, dry-run por defecto y escritura solo con `--apply`.
- Nota operativa: `npm run dev` del frontend usa `.env.dev` y apunta a `https://cronos-backend-development.up.railway.app`; para usar el backend local en `localhost:3030` se debe ejecutar `npm run local`.

## 2026-07-21 - Restauracion de patientsList

- La API local demostro que `GET /patients/getRequest` devolvia datos para todo usuario con `patientsList`, pero la cuenta NLSSA004162 restante tenia esa lista vacia.
- Causa de codigo adicional: `userPatchResolver` descartaba `patientsList` en todos los patches externos desde `1a937ea`; el frontend recibia exito al agregar un paciente, pero la relacion no se persistia.
- Se permite actualizar `patientsList` solo cuando el usuario autenticado hace patch de su propio documento. Los patches sobre otros usuarios siguen descartando el campo y el acceso clinico permanece limitado por CLUES.
- Se agrego y aplico `scripts/backfill-empty-clinic-patient-lists.js` en `test`: una cuenta NLSSA004162 con lista vacia recibio los 154 pacientes de su establecimiento.
- Verificacion HTTP autenticada contra `localhost:3030`: status 200 y 10 pacientes devueltos, limite esperado de `getRequest`.

## 2026-08-19 — Semilla de catálogos en TemisDB

**Contexto:** la base de Temis (`temisdb.qk3u5v7`, DB `test`) se creó vacía; las 9
colecciones de catálogo que consulta `src/` no existían.

**Decisión:** repuntar los scripts de `scripts/Catalogos/*_to_mongo.py` en lugar de
copiar las colecciones desde el cluster de Cronos.

Los scripts leían de `~/Downloads`, donde los `.xlsx` ya no están. Ahora leen de
`CATALOG_DIR`, con default en iCloud y override por la variable de entorno
`NOT_CATALOG_DIR`:

```
~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Legal Docs/docs-cronos/NOM-024/GIIS/Catálogos
```

**Por qué no se copió desde Cronos:** son clusters distintos y los `.xlsx` sí
existían; leer de la fuente evita arrastrar a Temis la forma de documento de otro
producto.

**Entorno:** el `python3` del sistema tiene numpy roto (`incompatible architecture:
have 'arm64', need 'x86_64'`), así que pandas no importa. Los scripts se corrieron
desde un venv aparte (pandas 3.0.5 / numpy 2.5.2). Si hay que volver a correrlos,
créalo de nuevo — no vive en el repo.

**Sin sembrar, a propósito:**
- `cie-catalog` (`full_diagnosticos_to_mongo.py`) — falta `DIAGNOSTICOS.xlsx` y `src/`
  no consulta esa colección; usa `catalogo-dxcie-10`.
- `services-directory` (`services_directory_to_mongo.py`) — el archivo existe, pero
  ninguna parte de `src/` lee esa colección.

**Cuidado al re-correr:** los scripts hacen `insert_many` sin upsert y sin índice
único; correrlos dos veces duplica todo. Hay que borrar la colección antes.

## 2026-08-19 — Purga: Temis deja de ser Cronos

Temis va dirigido al sector gobierno. Eso cambia dos cosas de raíz: la app tiene
que ser ligera y auditable, y no puede haber un modelo de lenguaje entre lo que
el médico teclea y lo que se guarda en el expediente.

### La única IA que queda

`hooks/records/consult-type-detection.ts`. Detecta si el paciente es geriátrico,
pediátrico o cursa embarazo y, con eso, `ConfirmMedRecord` obliga a llenar el
formulario de variables clínicas que corresponde. Es la razón de ser de la IA en
Temis: que el médico no pueda saltarse la información que la norma exige.

Se conserva completo, incluidas las variables COFEPRIS que ya emite — son la base
de la fase siguiente. `openai` y `zod` siguen en `package.json` por este hook.

### Eliminado del backend

| Qué | Por qué |
|---|---|
| `hooks/records/patient-diagnoser.ts` | Extraía diagnósticos del texto libre |
| `hooks/records/hospital-ids-retriever.ts` | Deducía la ficha de identificación del texto |
| `hooks/records/location-validator.ts` | Resolvía domicilios contra catálogos vía LLM |
| `hooks/records/record-router.ts` | Sólo orquestaba los dos anteriores |
| `hooks/{labs,drugs,somas}/format_*.ts` | Convertían texto libre en valores |
| `hooks/generic/tester.ts` | Banco de pruebas de prompts |
| `services/ai/**` | Asistente, síntesis de HC/notas e informes de aseguradora |
| `services/transcriber/**` | Voz a texto |
| `services/maps/**` + `hooks/maps/` | Diagnósticos diferenciales |
| `services/demo/**` | Demo comercial |
| Acciones de `uploads`: `newPatient`, `AIImgExtraction`, `OCRextraction` | Lectura de PDFs e imágenes |

`uploads` conserva `INEextraction`, `CURPRenapo` (NUFI/RENAPO — validación de
identidad, no IA) y `phoneUpload`. Fuera `tesseract.js` y `pdf-parse`.

`record_doc_type.ts` se reescribió: la identificación llega estructurada desde
`PatientIdentityPanel` y si falta se responde `BadRequest`, en vez de adivinarla.
De paso se limpiaron los bloques de conflicto de merge comentados que arrastraba.

### Captura estructurada: labs y fármacos

Es el cambio con más superficie y no era opcional. Ambos servicios recibían
`baseText` — texto libre que el LLM parseaba. Al quitar el LLM no quedaba forma de
capturarlos, y las dos secciones se quedan.

- **Labs:** nuevo `components/LabValuesEditor-CC.tsx`, un renglón por parámetro
  contra `scripts/LabCatalog.ts` (espejo de `LabBaseParameters` del backend, 11
  entradas con abreviación y unidad). El schema pasó de `baseText` a `values`.
- **Fármacos:** `Prescriber` ya capturaba presentación + indicación de forma
  estructurada y sólo las concatenaba para que el LLM las volviera a separar.
  Ahora se mandan tal cual. `DrugValues` pasó de cinco campos
  (`name`/`comercial`/`presentation`/`dosage`/`course`) a dos (`name`,
  `indication`), que es lo que la UI realmente captura. `PrescriptionPDF` y
  `Prescription-CC` se ajustaron.
- **Somas** ya tenía `build_somas_from_values`; sólo se le quitó el fallback a IA.

**Ojo:** el cambio de forma de `DrugValues` es incompatible con los documentos que
tenga Cronos. Temis arranca con base vacía, así que no hay migración pendiente,
pero no copies colecciones de `drugs` entre los dos productos.

### Eliminado del frontend

Rutas `demo/**`, `textTranscriber`, `patientRecorder`, `fileAnalyzer` y
`mobile/phoneMic`. Componentes `Lottie-CC`, `Microphone-CC`, `MindMap-CC`,
`AiLoader`, `AI-assistant`, `DfdxIntegrator`, secciones `DifferentialDiagnosis` e
`InsuranceReports`. Las 40 animaciones Lottie (5.2 MB) y las dependencias
`lottie-react`, `recordrtc` y `@types/recordrtc`.

`textTranscriber` se reemplazó por `newPatient/clinicalRecord`, que monta
`SavePatientForm` directo. El paso "Método de Agregación" (texto/voz/archivo/
imagen) desapareció: sólo quedaba una opción.

`ChAITextArea` → `ClinicalTextArea` (y su `.styl`), con la prop `AIloading`
renombrada a `saving`.

`Configuration` perdió el editor de formatos base — las dos plantillas que
alimentaban la síntesis. El modal se dejó vacío a propósito: es el lugar natural
para la configuración COFEPRIS de la fase siguiente.

### Animaciones

Los Lottie se reemplazaron por SVG inline de `assets/icons/IconsCC.tsx`, al que se
le agregaron 11 iconos (`EmptyBox`, `Image`, `Notes`, `QuickNote`, `UploadFile`,
`Pencil`, `IdCard`, `IdSearch`, `Compass`, `Signature`). `Card-CC` perdió la
maquinaria de pausa/reanudación: `IntersectionObserver`, listener de `resize`,
tres `useState` y la prop `disableScrollHover`, que sólo existían para pausar
animaciones que ya no hay.

**`motion/react` se queda** (14 archivos). Decisión explícita: son transiciones
baratas y sacarlo tocaba layout con riesgo alto de romper cosas sin ganar peso
real. Si en revisión se ve pesado, ese es el siguiente recorte.

### Lo que sobrevive

Agenda, consentimientos, somatometrías, laboratorios, imágenes de gabinete,
solicitudes de estudio, recetas, expediente compartido, PDFs, validación NUFI/
RENAPO y toda la validación GIIS/NOM-024.

### Siguiente fase

COFEPRIS: consulta externa, detecciones. El catálogo de variables clínicas de
`consult-type-detection` ya trae buena parte de la estructura.

## 2026-08-24 — Versionador interactivo en pre-commit

`scripts/bump-version.js` (heredado del fork de Cronos) ya estaba en el repo pero **nunca se activó**: el hook vive en `.git/hooks/pre-commit`, que git no versiona. Se instaló el hook en este repo y se cambió el encabezado de "Versionamiento CronosMD" a "Versionamiento Temis".

Ahora cada `git commit` pregunta el tipo de cambio y sube `package.json` en el nivel correspondiente (`MAJOR.SYSTEM.FEATURE.PATCH`), dejando el `package.json` ya en stage:

- `[1]` Small Feature — bug fix, diseño → 4º dígito
- `[2]` Big Feature — componente nuevo → 3º
- `[3]` System Feature — sistema completo → 2º
- `[4]` Mayor Reworkout — cambio total de flujo → 1º
- `[0]` Omitir — commitea sin tocar la versión

**Importante:** el hook no se clona. En cada máquina/clon nuevo hay que correr una vez:

```bash
bash scripts/install-version-hook.sh
```
