# Decisiones - Odontología

## 2026-09-12 - Rol autónomo y GIIS-B016

- `odontologo` es un rol clínico autónomo con las mismas secciones y permisos de
  dashboard que `medico`. Se deriva en `userDataResolver` al resolver la etiqueta
  exacta de `professionType` con la tabla canónica `TIPO_PERSONAL`; el cliente no
  puede asignarlo.
- `TIPO_PERSONAL` es la única tabla nombre-código para el alta, el router y la
  exportación. El regex anterior de `mapTipoPersonal` esperaba por error el
  formato numerado de `Especialidades`, pero `professionType` guarda las cadenas
  legibles de `TipoPersonal`; por eso devolvía `null` para todos los usuarios.
  Frontend y backend mantienen byte-idénticas las diez etiquetas activas.
- `odontologo` no pertenece a `TEAM_ROLES`: conserva pacientes propios y no
  requiere tutor. `TEAM_ROLES` continúa limitado a `enfermeria`.
- El ruteo es excluyente en `hojasPosibles` y `hojasActivas`: odontología recibe
  solo `CSB`; el resto conserva CEX, DET y CPF sin cambios.
- Para CSB, `FlagsSchema` se reduce a un objeto vacío y el prompt no solicita
  embarazo, pediatría, detecciones ni planificación familiar. Ninguna de esas
  señales decide la aplicabilidad de B016.
- En la base de desarrollo, `VALIDO_SB` está poblado en las 9,302 entradas
  revisadas. Sus formas observadas son `NO` (8,901), la lista `12,13,14,23`
  (295) y el valor numérico `14` (106). El validador admite listas separadas por
  comas y valores numéricos, y rechaza `NO` para una atención odontológica.
- `catalogo-serv-by-type` no implementa SERVICIOS DE ATENCIÓN POR TIPO DE
  PERSONAL SIS-SB: solo guarda `CATALOG_KEY` y `DESCRIPCION`, mezcla servicios
  generales y dentales y no conserva relación con `tipoPersonal`. No se inventó
  una relación. Hace falta incorporar el catálogo relacional oficial antes de
  filtrar por los tipos 12, 13, 14 y 23 con fidelidad.
- Se autorizó expresamente ampliar el alcance a
  `frontend/src/library/Dashboard/DashboardRegistry.tsx`, porque sus mapas
  `Record<UserRole, ...>` deben incluir el nuevo rol para compilar y para darle
  el dashboard médico.

Fuera de alcance: constructor del renglón CSB, odontograma e interfaz dental, y
cambios a los cuatro campos de la nota de evolución.
