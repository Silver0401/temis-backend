# Progreso — Servicio SUIVE

**Fecha:** 2026-09-12

## Completado y verificado

- Ejecutada la compuerta Mongo de solo lectura para `ES_SUIVE_MORB`,
  `EPI_CLAVE` y formato real de `records.Diagnosis[].CIE`; resultados detallados
  en `DECISIONS-suive.entry.md`.
- Implementado `src/scripts/extract-suive-catalog.ts` y generado
  `src/services/suive/suive.catalog.ts` desde `docs/giis/SUIVE-1.xlsx`.
- Cotejados XLSX y `suive-extraccion-preliminar.json`: ambos tienen 184
  diagnósticos y los mismos 18 grupos con diagnóstico. La fila 210 contiene un
  grupo adicional sin diagnóstico, no una entrada perdida ni una diferencia de
  normalización de espacios.
- Implementado y registrado el servicio autenticado `suive`, con recorrido en
  serie, todas las consultas del rango, JOIN CIE→EPI en memoria, resumen,
  omisiones, avisos y alcance para administración, medicina y enfermería.
- Implementado el reporte en administración: mismo rango/paginado del archivo
  de intercambio, resumen visible, avisos y descarga CSV.
- Implementado el reporte en “Mis Pacientes”: botón en la barra de acciones,
  selector de rango, resumen visible y descarga mediante el mismo helper CSV de
  administración (`frontend/src/scripts/suiveReport.ts`).
- `npx tsc --noEmit` ejecutado sin errores en backend.
- `npx tsc --noEmit` ejecutado sin errores en frontend.
- Suite SUIVE ejecutada con el comando acordado: 6 pruebas aprobadas.

## Pendiente / no verificado

- No se ejecutó `npm run build`, por restricción expresa de esta sesión.
- No se reinició el backend ni se hizo QA manual del flujo HTTP/UI.
- No se generó un informe contra pacientes clínicos reales; las consultas de
  diagnóstico usadas durante la compuerta solo produjeron conteos agregados y
  las pruebas del servicio usan dobles en memoria.
- El grupo declarado en la fila 210 del XLSX sigue sin diagnósticos; si se recibe
  una versión del catálogo con entradas para ese grupo, se deberá regenerar el
  catálogo y actualizar el conteo esperado.
