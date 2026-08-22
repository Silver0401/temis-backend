# Progreso

## 2026-07-23 - Alta externa de paciente por QR / link

- Se revisaron `patients`, `users`, `updateUserPatients`, `patientsDataResolver`, `giisPatientValidator` y el scope por CLUES.
- Se confirmo que el alta normal hereda las CLUES del usuario y que el hook `updateUserPatients` agrega el `_id` creado a `users.patientsList`.
- Se decidio implementar un servicio publico separado, `external-patient-registration`, exponiendo unicamente `create`.
- Se creo inicialmente `external-patient-registration.shared.ts`; faltan schema, clase, registro y pruebas.

## 2026-07-20 - Diagnostico de pacientes no visibles

- Se revisaron el servicio `patients`, hooks, schemas, permisos, consultas MongoDB y el flujo frontend del dashboard.
- Se identifico el commit regresivo `1a937ea`, que introdujo el scope por CLUES y el campo `patients.clues`.
- Se ejecuto `scripts/backfill-patient-clues.js` en modo dry-run, sin escrituras: desarrollo reporto 154 pacientes pendientes; produccion reporto su unico paciente pendiente y recuperable desde `users.patientsList`.
- No se modifico codigo ni base de datos. El fix espera aprobacion explicita.

## 2026-07-21 - Backfill CLUES aplicado

- Se agrego `scripts/set-all-patient-clues.js` para asignar `NLSSA004162` a todos los pacientes.
- El script valida el formato de la CLUES, opera en dry-run por defecto y solo escribe con `--apply`.
- Dry-run de produccion: 1 paciente total y 1 pendiente.
- Aplicacion en produccion: 1 paciente modificado.
- Verificacion posterior: 1 paciente total y 0 pendientes.
- Aplicacion en base `test`: 154 pacientes modificados; verificacion posterior con 0 pendientes.

## 2026-07-21 - Segunda correccion de dashboard vacio

- Se detecto que las CLUES de usuarios no coincidian literalmente con la CLUES canonica de pacientes.
- Se normalizan etiquetas de catalogo como `NLSSA004162 - C.S.U. HIDALGO` a `NLSSA004162` en `scope-by-clues.ts`.
- Se agrego y aplico `scripts/set-patient-owner-clues.js` en `test`: 10 usuarios propietarios actualizados y 0 pendientes.
- Prueba unitaria de regresion: 1 passing.
- Build TypeScript: exitoso.
- Verificacion de datos: 10 propietarios, 0 con lista visible vacia y 26 pacientes visibles dentro de sus ventanas de dashboard.
- La suite completa no pudo arrancar sin `OPENAI_API_KEY`; el fallo ocurre al importar `format_somas.ts`, antes de ejecutar pruebas.

## 2026-07-21 - Persistencia y backfill de patientsList

- Se reprodujo `GET /patients/getRequest` con JWT contra el backend local: todos los usuarios propietarios obtenian pacientes.
- Se encontro una cuenta NLSSA004162 con lista vacia y el resolver que eliminaba silenciosamente `patientsList` de `PATCH /users` externos.
- Se corrigio `users.schema.ts` para aceptar cambios de `patientsList` unicamente en auto-patches.
- Verificacion de patch autenticado: status 200 y 99 referencias preservadas.
- Se agrego y aplico el backfill de listas vacias: 1 usuario modificado, 0 candidatos pendientes.
- Verificacion final del usuario reparado: 154 referencias y 10 pacientes devueltos por el endpoint local.

## 2026-08-19 — Catálogos sembrados en TemisDB

Las 9 colecciones de catálogo que consulta `src/` quedaron pobladas en `test`:

| Colección | Docs |
|---|---:|
| catalogo-afiliaciones | 15 |
| catalogo-dxcie-10 | 9,302 |
| catalogo-ent-fed | 35 |
| catalogo-establecimientos | 15,305 |
| catalogo-localidades | 296,806 |
| catalogo-municipios | 2,478 |
| catalogo-paises | 225 |
| catalogo-personal-type | 30 |
| catalogo-serv-by-type | 73 |

Total: 324,269 documentos. Ver `DECISIONS.md` para el cambio de rutas de los
scripts y el detalle del entorno.
