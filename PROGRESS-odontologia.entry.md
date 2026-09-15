# Progreso - Odontología

## 2026-09-12 - Rol odontólogo y Consulta Externa de Salud Bucal

- Documentado el diccionario completo de las 77 variables de GIIS-B016 en
  `docs/giis/B016-salud-bucal.md`; las variables 44-68 se identificaron como el
  grupo nuevo `SaludBucal`.
- Agregado el rol `odontologo`, derivado en el servidor al mapear las etiquetas
  oficiales de odontología a 12, 13, 14 y 23 mediante `TIPO_PERSONAL`, sin
  permitir autoasignación por patch externo.
- Reutilizado el dashboard y alcance CLUES del médico; el rol no entra al flujo
  tutelado de enfermería.
- Agregados `GuideCode` CSB, target `SaludBucal`, contexto con rol,
  `esOdontologo`, nodo con 25 campos y bifurcación excluyente en las dos fases
  del router.
- Recortados los flags de IA para la rama odontológica.
- Extendida la validación CIE con `VALIDO_SB` según el formato observado en
  MongoDB, sin registrar datos clínicos.
- Agregadas pruebas de ruteo, campos/rangos y formatos de `VALIDO_SB` en
  `test/hooks/guide-router/`.
- Corregido `mapTipoPersonal`: ahora consume la misma tabla que el exportador en
  lugar de aplicar a `professionType` el formato numérico de `Especialidades`.
  Las pruebas recorren las diez etiquetas reales y ejercitan
  `userDataResolver` y `buildRoutingContext`.
- Pendiente externo: cargar/modelar el catálogo relacional SIS-SB para filtrar
  `servicioAtencion` por tipo de personal y aplicar con fuente oficial la
  restricción de Odontopediatría.
