# Decisiones — Servicio SUIVE

**Fecha:** 2026-09-12

## Catálogo de Mongo como filtro primario

El servicio decide si un CIE es notificable mediante un JOIN en memoria contra
`catalogo-dxcie-10`: `ES_SUIVE_MORB === "SI"` marca la pertenencia y
`EPI_CLAVE` identifica el diagnóstico epidemiológico. El XLSX no se usa para
decidir pertenencia; solo enriquece la clave EPI con nombre SUIVE, grupo y los
marcadores `*`, `+` y `#`.

La compuerta de solo lectura sobre Mongo encontró:

- `ES_SUIVE_MORB`: 8,252 documentos con `NO` y 1,050 con `SI`.
- Entre los marcados `SI`, `EPI_CLAVE` tiene 999 enteros y 51 strings, aunque el
  schema TypeBox lo declara string. 1,045 valores son numéricos después de
  normalizarlos y representan 148 claves EPI distintas.
- Cinco códigos (`U089`, `U099`, `U109`, `U119`, `U129`) están marcados `SI`
  pero tienen `EPI_CLAVE: "NO"`. No se inventa una clave: el diagnóstico no
  genera caso y la respuesta lo registra en `avisos`.
- Mongo contiene claves numéricas que el XLSX no trae. Esto es esperado porque
  el XLSX disponible no es exhaustivo. Esas claves sí generan caso con el nombre
  de Mongo, grupo `Sin grupo en catálogo SUIVE`, marcadores en falso y un aviso
  explícito de falta de enriquecimiento.

## Cruce de claves CIE

Ambos lados se normalizan con mayúsculas y eliminación de caracteres que no
sean letras o números. En los datos de desarrollo había tres diagnósticos
persistidos: los tres usaban claves de cuatro caracteres sin punto y los tres
cruzaron exactamente con `CATALOG_KEY`.

El matcher de rangos queda solo como respaldo y como información auditable en
`suive.catalog.ts`; no participa en el filtro. Además de que el JOIN exacto
funcionó, 21 categorías de tres caracteres del catálogo SUIVE conducen a más de
una clave EPI, por lo que un fallback automático por categoría podría atribuir
un caso al diagnóstico equivocado.

## Catálogo generado

`src/scripts/extract-suive-catalog.ts` lee el XML interno del XLSX mediante la
herramienta estándar `unzip`, sin dependencia de producción ni lectura del XLSX
en runtime. Falla si no obtiene 184 diagnósticos, si una clave EPI falta o se
duplica, si un código deja residuos sin parsear o si difiere de la extracción
preliminar.

El XLSX y `suive-extraccion-preliminar.json` coinciden en 184 diagnósticos y 18
grupos distintos con diagnósticos. El supuesto grupo 19 aparece en la fila 210
como `OTRAS ENFERMEDADES DE INTERÉS LOCAL Y/O REGIONAL`, pero no tiene ningún
diagnóstico ni clave EPI asociado; por eso no puede formar parte del
`Record<number, SuiveDiagnostico>`. No fue eliminado por normalización.

## Alcance y omisiones

- Administración puede solicitar cualquier id recibido desde su buscador.
- Medicina se intersecta contra su `patientsList`.
- Enfermería usa el `patientsList` que `scope-by-role-and-tutor` ya redujo a las
  asignaciones vigentes de sus tutores.
- Un id fuera de alcance se agrega a `omitidos` con `Fuera de tu alcance`; nunca
  devuelve 403, para no convertir el endpoint en un oráculo de ids existentes.

El SUIVE lee todas las consultas del intervalo porque cuenta casos nuevos. Esto
difiere deliberadamente de `exchange-file`, que toma una consulta por paciente.

## Duplicación temporal de helpers

El rango por ObjectId y los helpers de fecha/edad viven en
`src/utils/mongo-id-range.ts`. No se modificó
`exchange-file/exchange-file.class.ts`: la duplicación es deliberada para
respetar el alcance concurrente y debe deduplicarse en una pasada separada con
respaldo propio.
