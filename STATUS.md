# Estado

## 2026-07-23 - Alta externa por QR / link

- **Estado actual:** investigacion completa; iniciado el contrato `create` del servicio `external-patient-registration`.
- **Seguridad:** sera un servicio publico con solo `create`, schema cerrado y rate limit; el `doctorId` no habilitara lectura, busqueda, patch ni remove.
- **Siguiente accion:** completar schema/clase/registro, probar build y verificar alta + asociacion a `patientsList`.

## 2026-07-21

- **Estado actual:** pacientes, CLUES y `patientsList` de `test` estan reparados; futuros auto-patches de la lista vuelven a persistirse.
- **Verificacion:** la cuenta NLSSA004162 reparada recibe status 200 y 10 pacientes desde `localhost:3030`.
- **Bloqueadores:** ninguno para la visibilidad por CLUES.
- **Siguiente accion:** recargar el dashboard; si conserva cache anterior, cerrar sesion y volver a entrar.
- **Scripts:** `set-all-patient-clues.js`, `set-patient-owner-clues.js` y `backfill-empty-clinic-patient-lists.js`.

## 2026-08-19 — Fase de purga completada

Temis quedó separado de Cronos: sin síntesis por IA, sin transcripción de voz, sin
lectores de archivo, sin diagnósticos diferenciales y sin animaciones Lottie.

La única IA activa es la detección de tipo de paciente
(`hooks/records/consult-type-detection.ts`), que dispara los formularios de
variables clínicas obligatorios.

Labs y fármacos se capturan ahora de forma estructurada; era condición para poder
quitar el LLM sin perder esas secciones.

`tsc --noEmit` limpio en backend y frontend; `next build` compila las 18 rutas.

**Sin verificar en navegador.** Falta tu revisión visual — sobre todo las tarjetas
del dashboard (los iconos sustituyeron animaciones que ocupaban otro espacio) y el
nuevo editor de laboratorios.

Siguiente: implementación COFEPRIS (consulta externa, detecciones).
