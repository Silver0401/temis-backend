# GIIS-B016-04-08 - Consulta Externa de Salud Bucal

Fuente: `GIIS-B016-04-08.txt`, versión 4.8 del 1 de noviembre de 2024, y
`CSB-EJEMPLOS-2410.txt`. El archivo de intercambio usa el prefijo `CSB` y conserva
las 77 variables en el orden indicado. Todos los campos deben existir en el
archivo; la obligatoriedad de la tabla indica cuándo deben llevar un valor. Solo
`codigoCIEDiagnostico2` y `codigoCIEDiagnostico3` pueden ir vacíos.

## Diccionario

La columna Estado se refiere a la captura y persistencia actual de Temis. Las
variables marcadas como NUEVA forman el grupo `SaludBucal`; las demás ya tienen
fuente en el usuario, paciente, somatometría, diagnóstico o record.

| ID | Variable / encabezado | Descripción | Tipo | Obligatorio | Catálogo y validación | Estado |
|---:|---|---|---|---|---|---|
| 1 | `clues` / `CLUES` | Unidad donde se otorgó la atención | Texto (11) | Sí | ESTABLECIMIENTO DE SALUD SIS; debe estar en operación | YA EXISTE: CLUES del usuario/paciente |
| 2 | `paisNacimiento` / `PAISNACIMIENTO` | País de nacimiento del prestador | Numérico | Sí | PAÍS | YA EXISTE: localización de nacimiento del usuario |
| 3 | `curpPrestador` / `CURPPRESTADOR` | CURP del prestador | Texto (18) | Sí | RENAPO; admite CURP genérica para extranjero | YA EXISTE: usuario |
| 4 | `nombrePrestador` / `NOMBREPRESTADOR` | Nombre del prestador | Texto (50) | Sí | 2-50 caracteres, mayúsculas y caracteres permitidos | YA EXISTE: usuario |
| 5 | `primerApellidoPrestador` / `PRIMERAPELLIDOPRESTADOR` | Primer apellido del prestador | Texto (50) | Sí | Reglas de nombre; `XX` si no existe | YA EXISTE: usuario |
| 6 | `segundoApellidoPrestador` / `SEGUNDOAPELLIDOPRESTADOR` | Segundo apellido del prestador | Texto (50) | Sí | Reglas de nombre; `XX` si no existe | YA EXISTE: usuario |
| 7 | `tipoPersonal` / `TIPOPERSONAL` | Tipo de profesional | Numérico | Sí | Solo 12 pasante, 13 odontólogo, 14 especialista o 23 técnico en odontología | YA EXISTE: `professionType` del usuario |
| 8 | `programaSMyMG` / `PROGRAMASMYMG` | Contratación por programa U013 | Numérico | Sí | 0 No, 1 Sí; fuera de SSA/IMB debe ser 0 | YA EXISTE: dato transversal del prestador; pendiente del constructor CSB |
| 9 | `curpPaciente` / `CURPPACIENTE` | CURP del paciente | Texto (18) | Sí | RENAPO; admite `XXXX999999XXXXXX99` por excepción | YA EXISTE: identificación del paciente |
| 10 | `nombre` / `NOMBRE` | Nombre del paciente | Texto (50) | Sí | 2-50 caracteres y reglas RENAPO | YA EXISTE: `PatientIdentificationSchema` |
| 11 | `primerApellido` / `PRIMERAPELLIDO` | Primer apellido del paciente | Texto (50) | Sí | Reglas de nombre; `XX` si no existe | YA EXISTE: `PatientIdentificationSchema` |
| 12 | `segundoApellido` / `SEGUNDOAPELLIDO` | Segundo apellido del paciente | Texto (50) | Sí | Reglas de nombre; `XX` si no existe | YA EXISTE: `PatientIdentificationSchema` |
| 13 | `fechaNacimiento` / `FECHANACIMIENTO` | Fecha de nacimiento | Texto (10) | Sí | `dd/mm/aaaa`; edad máxima 120; fecha estimada permitida con CURP genérica | YA EXISTE: `PatientIdentificationSchema` |
| 14 | `paisNacPaciente` / `PAISNACPACIENTE` | País de nacimiento del paciente | Numérico | Sí | PAÍS | YA EXISTE: localización de nacimiento del paciente |
| 15 | `entidadNacimiento` / `ENTIDADNACIMIENTO` | Entidad de nacimiento | Texto (2) | Sí | ENTIDAD FEDERATIVA; 99 se ignora, 00 no especificado, 88 extranjero | YA EXISTE: localización de nacimiento del paciente |
| 16 | `sexoCURP` / `SEXOCURP` | Sexo registrado ante RENAPO | Numérico | Sí | 1 Hombre, 2 Mujer, 3 No binario; consistente con CURP | YA EXISTE: identificación del paciente |
| 17 | `sexoBiologico` / `SEXOBIOLOGICO` | Condición biológica de nacimiento | Numérico | Sí | 1 Hombre, 2 Mujer, 3 Intersexual | YA EXISTE: `PatientIdentificationSchema` |
| 18 | `seAutodenominaAfromexicano` / `SEAUTODENOMINAAFROMEXICANO` | Autodenominación afromexicana | Numérico | Sí | -1 desconocido, 0 No, 1 Sí, 2 No responde, 3 No sabe | YA EXISTE: identificación persistida del paciente |
| 19 | `seConsideraIndigena` / `SECONSIDERAINDIGENA` | Se considera indígena | Numérico | Sí | -1 desconocido, 0 No, 1 Sí, 2 No responde, 3 No sabe | YA EXISTE: identificación persistida del paciente |
| 20 | `migrante` / `MIGRANTE` | Condición migrante | Numérico | Sí | -1 desconocido, 0 No, 1 Nacional, 2 Internacional, 3 Retornado | YA EXISTE: identificación persistida del paciente |
| 21 | `paisProcedencia` / `PAISPROCEDENCIA` | País de procedencia migrante | Numérico | Sí | PAÍS; 142 para nacional/retornado, distinto de 142 para internacional, -1 si no aplica | YA EXISTE: identificación persistida del paciente |
| 22 | `genero` / `GENERO` | Identidad de género | Numérico | Sí | 0 no especificado, 1 masculino, 2 femenino, 3 transgénero, 4 transexual, 5 travesti, 6 intersexual, 88 otro | YA EXISTE: `PatientIdentificationSchema.genre` |
| 23 | `derechohabiencia` / `DERECHOHABIENCIA` | Afiliaciones al SNS | Texto (20) | Sí | AFILIACIÓN; hasta 9 claves separadas por `&`; 0, 1 y 99 son excluyentes | YA EXISTE: `PatientIdentificationSchema.derechohabiencia` |
| 24 | `fechaConsulta` / `FECHACONSULTA` | Fecha de consulta | Texto (10) | Sí | `dd/mm/aaaa`, no futura ni anterior al nacimiento | YA EXISTE: fecha derivada del record |
| 25 | `servicioAtencion` / `SERVICIOATENCION` | Servicio proporcionado | Numérico | Sí | SERVICIOS DE ATENCIÓN POR TIPO DE PERSONAL SIS-SB; 12 Odontopediatría exige edad menor de 18 | YA EXISTE: `recordsSchema.ServiceArea`; falta catálogo SIS-SB relacional |
| 26 | `peso` / `PESO` | Peso en kg | Numérico | Sí | 1-400; 999 desconocido | YA EXISTE: somatometría |
| 27 | `talla` / `TALLA` | Talla en cm | Numérico | Sí | 30-220; 999 desconocido | YA EXISTE: somatometría |
| 28 | `circunferenciaCintura` / `CIRCUNFERENCIACINTURA` | Circunferencia de cintura en cm | Numérico | Sí | 20-300; 0 desconocido | YA EXISTE: somatometría |
| 29 | `sistolica` / `SISTOLICA` | Presión sistólica | Numérico | Sí | 50-300 si hay diastólica; debe ser mayor o igual; 0 desconocido | YA EXISTE: somatometría |
| 30 | `diastolica` / `DIASTOLICA` | Presión diastólica | Numérico | Sí | 20-200 si hay sistólica; debe ser menor o igual; 0 desconocido | YA EXISTE: somatometría |
| 31 | `frecuenciaCardiaca` / `FRECUENCIACARDIACA` | Latidos por minuto | Numérico | Sí | 40-220; 0 desconocido | YA EXISTE: somatometría |
| 32 | `frecuenciaRespiratoria` / `FRECUENCIARESPIRATORIA` | Respiraciones por minuto | Numérico | Sí | 10-99; 0 desconocido | YA EXISTE: somatometría |
| 33 | `temperatura` / `TEMPERATURA` | Temperatura corporal | Numérico | Sí | 30-44 °C; 0 desconocido | YA EXISTE: somatometría |
| 34 | `saturacionOxigeno` / `SATURACIONOXIGENO` | SpO2 | Numérico | Sí | 1-100; 0 desconocido | YA EXISTE: somatometría |
| 35 | `glucemia` / `GLUCEMIA` | Glucosa en sangre | Numérico | Sí | 20-999; 0 desconocido | YA EXISTE: somatometría |
| 36 | `tipoMedicion` / `TIPOMEDICION` | Glucemia en ayuno | Numérico | Sí | 0 No, 1 Sí; -1 si glucemia es 0 o se desconoce | YA EXISTE: somatometría |
| 37 | `primeraVezAnio` / `PRIMERAVEZANIO` | Primera consulta anual en la unidad | Numérico | Sí | 1 si no existe atención previa; 0 si existe | YA EXISTE: `recordsSchema.FirstTimeInYear` |
| 38 | `relacionTemporal` / `RELACIONTEMPORAL` | Primera vez o subsecuente por motivo | Numérico | Sí | 0 Primera vez, 1 Subsecuente | YA EXISTE: `recordsSchema.Temporality` |
| 39 | `codigoCIEDiagnostico1` / `CODIGOCIEDIAGNOSTICO1` | Diagnóstico principal | Texto (4) | Sí | DIAGNOSTICO_SIS; LSEX/LINF/LSUP y `VALIDO_SB` deben admitir `tipoPersonal` | YA EXISTE: `recordsSchema.Diagnosis` |
| 40 | `primeraVezDiagnostico2` / `PRIMERAVEZDIAGNOSTICO2` | Primera vez del segundo diagnóstico | Numérico | Sí | 0 No, 1 Sí, -1 no aplica | YA EXISTE: diagnóstico/temporalidad del record |
| 41 | `codigoCIEDiagnostico2` / `CODIGOCIEDIAGNOSTICO2` | Segundo diagnóstico | Texto (4) | No, condicional | Vacío si campo 40 es -1; distinto del primero salvo R69X; mismas validaciones CIE | YA EXISTE: `recordsSchema.Diagnosis` |
| 42 | `primeraVezDiagnostico3` / `PRIMERAVEZDIAGNOSTICO3` | Primera vez del tercer diagnóstico | Numérico | Sí | 0 No, 1 Sí, -1 no aplica | YA EXISTE: diagnóstico/temporalidad del record |
| 43 | `codigoCIEDiagnostico3` / `CODIGOCIEDIAGNOSTICO3` | Tercer diagnóstico | Texto (4) | No, condicional | Vacío si campo 42 es -1; distinto de anteriores salvo R69X; mismas validaciones CIE | YA EXISTE: `recordsSchema.Diagnosis` |
| 44 | `placaBacteriana` / `PLACABACTERIANA` | Detección de placa bacteriana | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 45 | `cepillado` / `CEPILLADO` | Instrucción en técnica de cepillado | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 46 | `hiloDental` / `HILODENTAL` | Instrucción en uso de hilo dental | Numérico | Sí | 0 No, 1 Sí desde 6 años; -1 en menores de 6 | NUEVA: `SaludBucal` |
| 47 | `limpiezaDental` / `LIMPIEZADENTAL` | Limpieza dental | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 48 | `protesis` / `PROTESIS` | Revisión e higiene de prótesis bucales | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 49 | `tejidosBucales` / `TEJIDOSBUCALES` | Examen de tejidos bucales | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 50 | `autoExamen` / `AUTOEXAMEN` | Autoexamen de cavidad bucal | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 51 | `fluor` / `FLUOR` | Aplicación tópica de flúor | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 52 | `raspadoAlisadoPeriodontal` / `RASPADOALISADOPERIODONTAL` | Raspado y alisado periodontal | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 53 | `barnizFluor` / `BARNIZFLUOR` | Aplicación de barniz de flúor | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 54 | `fosetasFisuras` / `FOSETASFISURAS` | Número de fosetas y fisuras selladas | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 55 | `amalgamas` / `AMALGAMAS` | Número de obturaciones con amalgama | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 56 | `resinas` / `RESINAS` | Número de obturaciones con resina | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 57 | `ionomeroVidrio` / `IONOMEROVIDRIO` | Número de obturaciones con ionómero de vidrio | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 58 | `alcasite` / `ALCASITE` | Número de obturaciones con alcasite | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 59 | `obturacionTemporal` / `OBTURACIONTEMPORAL` | Número de obturaciones temporales | Numérico | Sí | 1-32; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 60 | `dienteTemp` / `DIENTETEMP` | Extracciones de dientes temporales | Numérico | Sí | 1-9; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 61 | `dientePerm` / `DIENTEPERM` | Extracciones de dientes permanentes | Numérico | Sí | 1-9; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 62 | `pulpar` / `PULPAR` | Piezas tratadas con terapia pulpar | Numérico | Sí | 1-9; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 63 | `cirugiaBucal` / `CIRUGIABUCAL` | Actividad quirúrgica menor | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 64 | `farmacoTerapia` / `FARMACOTERAPIA` | Prescripción de fármacos durante la atención | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 65 | `otrasAtenciones` / `OTRASATENCIONES` | Otras atenciones otorgadas | Numérico | Sí | 1-9; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 66 | `radiografias` / `RADIOGRAFIAS` | Radiografías dentales tomadas | Numérico | Sí | 1-9; 0 desconocido o no aplica | NUEVA: `SaludBucal` |
| 67 | `orientacionSaludBucal` / `ORIENTACIONSALUDBUCAL` | Orientación de salud bucal | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 68 | `tratamientoIntegral` / `TRATAMIENTOINTEGRAL` | Tratamiento concluido integralmente | Numérico | Sí | 0 No, 1 Sí | NUEVA: `SaludBucal` |
| 69 | `lineaVida` / `LINEAVIDA` | Consulta integrada con cinco o más acciones | Numérico | Sí | 0 No, 1 Sí | YA EXISTE: `Administrativas` |
| 70 | `cartillaSalud` / `CARTILLASALUD` | Presenta cartilla de salud | Numérico | Sí | 0 No, 1 Sí | YA EXISTE: `Administrativas` |
| 71 | `esquemaVacunacion` / `ESQUEMAVACUNACION` | Esquema de vacunación completo | Numérico | Sí | 0 No, 1 Sí | YA EXISTE: `Administrativas` |
| 72 | `referidoPor` / `REFERIDOPOR` | Motivo de referencia | Numérico | Sí | 5 Otras cuando contrarreferido=0; -1 en otro caso/no aplica | YA EXISTE: `Administrativas` |
| 73 | `contrarreferido` / `CONTRARREFERIDO` | Paciente contrarreferido | Numérico | Sí | 0 No, 1 Sí si referidoPor=-1; en otro caso 0 | YA EXISTE: `Administrativas` |
| 74 | `telemedicina` / `TELEMEDICINA` | Interconsulta solicitada por telemedicina | Numérico | Sí | 0 No, 1 Sí; relación excluyente con teleconsulta | YA EXISTE: `Administrativas` |
| 75 | `teleconsulta` / `TELECONSULTA` | Consulta a distancia entre unidades | Numérico | Sí | 0 No, 1 Sí; relación excluyente con telemedicina | YA EXISTE: `Administrativas` |
| 76 | `estudiosTeleconsulta` / `ESTUDIOSTELECONSULTA` | Estudios valorados a distancia | Texto (15) | Sí | 1 USG, 2 ECG, 3 Rayos X, 4 Tomografía, 5 RM, 6 Mastografía, 7 Otros; multivalor `&`; -1 no aplica | YA EXISTE: `Administrativas` |
| 77 | `modalidadConsulDist` / `MODALIDADCONSULDIST` | Modalidad de consulta a distancia | Numérico | Sí | 1 tiempo real si teleconsulta=1; 2 diferida si estudios aplica; -1 en otro caso | YA EXISTE: `Administrativas` |

## Reglas transversales de B016

- Al menos una acción de Salud Bucal debe ser distinta de 0. En particular,
  `hiloDental` debe ser distinta tanto de 0 como de -1 para satisfacer por sí
  sola esta regla.
- `tipoPersonal` está restringido a 12, 13, 14 y 23.
- `servicioAtencion` debe usar SERVICIOS DE ATENCIÓN POR TIPO DE PERSONAL
  SIS-SB. La colección de desarrollo `catalogo-serv-by-type` solo contiene
  `CATALOG_KEY` y `DESCRIPCION`: mezcla servicios generales y dentales y no
  conserva la relación con `tipoPersonal`. Se requieren datos o una relación
  SIS-SB antes de poder filtrar con fidelidad; no se inventa.
- Si `servicioAtencion` es 12 (Odontopediatría), la edad debe ser menor de 18.
- Cada diagnóstico debe admitir el `tipoPersonal` en `VALIDO_SB`, además de
  cumplir LSEX, LINF y LSUP. En desarrollo el campo aparece como `NO`, una lista
  separada por comas (`12,13,14,23`) o un número (`14`).

## Cotejo

El texto extraído permite leer las 77 variables y sus catálogos. No quedó una
variable `PENDIENTE DE COTEJO`. Los nombres cortados por paginación se confirmaron
contra el encabezado oficial de ejemplos: `placaBacteriana`, `cepillado`,
`raspadoAlisadoPeriodontal` y `orientacionSaludBucal`.
