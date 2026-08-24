/**
 * GIIS-B015-04-11 v4.11 — Mapeos exactos de valores almacenados en CronosMD
 * a códigos numéricos del catálogo Cofepris.
 *
 * Los valores de la columna izquierda son los strings exactos almacenados
 * en MongoDB. Los números de la derecha son CATALOG_KEY del SIS.
 */

/**
 * Nombres de las 106 variables, en el orden del Diccionario de Datos de la
 * GIIS-B015-04-11 v4.11.
 *
 * La guía (apartado "CONFORMACIÓN DEL DOCUMENTO ELECTRÓNICO") exige que el
 * archivo de intercambio lleve como PRIMER renglón los nombres de todas las
 * variables, separados por "|", en este mismo orden.
 *
 * Los nombres se transcriben tal cual aparecen en la guía, erratas incluidas:
 * `hipertensionarterialprexistente` (sin la segunda "e" de "preexistente"),
 * `otrasAccApoyoTranslado` y `otrasACCApoyoTransladoAME` (con "Translado"), y
 * `aivd-ABVD` con guion. El validador del SINBA compara contra el nombre
 * literal de la guía, así que "corregirlos" rompería la carga.
 */
export const GIIS_FIELD_NAMES = [
  'clues',
  'paisNacimiento',
  'curpPrestador',
  'nombrePrestador',
  'primerApellidoPrestador',
  'segundoApellidoPrestador',
  'tipoPersonal',
  'programaSMyMG',
  'curpPaciente',
  'nombre',
  'primerApellido',
  'segundoApellido',
  'fechaNacimiento',
  'paisNacPaciente',
  'entidadNacimiento',
  'sexoCURP',
  'sexoBiologico',
  'seAutodenominaAfromexicano',
  'seConsideraIndigena',
  'migrante',
  'paisProcedencia',
  'genero',
  'derechohabiencia',
  'fechaConsulta',
  'servicioAtencion',
  'peso',
  'talla',
  'circunferenciaCintura',
  'sistolica',
  'diastolica',
  'frecuenciaCardiaca',
  'frecuenciaRespiratoria',
  'temperatura',
  'saturacionOxigeno',
  'glucemia',
  'tipoMedicion',
  'resultadoObtenidoaTravesde',
  'embarazadaSinDiabetes',
  'sintomaticoRespiratorioTb',
  'primeraVezAnio',
  'primeraVezUneme',
  'relacionTemporal',
  'codigoCIEDiagnostico1',
  'confirmacionDiagnostica1',
  'primeraVezDiagnostico2',
  'codigoCIEDiagnostico2',
  'confirmacionDiagnostica2',
  'primeraVezDiagnostico3',
  'codigoCIEDiagnostico3',
  'confirmacionDiagnostica3',
  'intervencionesSMyA',
  'atencionPregestacionalRT',
  'riesgo',
  'relacionTemporalEmbarazo',
  'planSeguridad',
  'trimestreGestacional',
  'primeraVezAltoRiesgo',
  'complicacionPorDiabetes',
  'complicacionPorInfeccionUrinaria',
  'complicacionPorPreeclampsiaEclampsia',
  'complicacionPorHemorragia',
  'sospechaCovid19',
  'covid19Confirmado',
  'hipertensionarterialprexistente',
  'otrasAccPrescAcidoFolico',
  'otrasAccApoyoTranslado',
  'otrasACCApoyoTransladoAME',
  'puerpera',
  'infeccionPuerperal',
  'terapiaHormonal',
  'periPostMenopausia',
  'its',
  'patologiaMamariaBenigna',
  'cancerMamario',
  'colposcopia',
  'cancerCervicouterino',
  'ninoSanoRT',
  'pruebaEDI',
  'resultadoEDI',
  'resultadoBattelle',
  'edasRT',
  'edasPlanTratamiento',
  'recuperadoDeshidratacion',
  'numeroSobresVSOTratamiento',
  'irasRT',
  'irasPlanTratamiento',
  'neumoniaRT',
  'aplicacionCedulaCancer',
  'informaPrevencionAccidentes',
  'sintomaDepresiva',
  'alteracionMemoria',
  'aivd-ABVD',
  'sindromeCaidas',
  'incontinenciaUrinaria',
  'motricidad',
  'asesoriaNutricional',
  'numeroSobresVSOPromocion',
  'lineaVida',
  'cartillaSalud',
  'esquemaVacunacion',
  'referidoPor',
  'contrarreferido',
  'telemedicina',
  'teleconsulta',
  'estudiosTeleconsulta',
  'modalidadConsulDist'
] as const

/** Primer renglón del archivo de intercambio. */
export const GIIS_HEADER_ROW = GIIS_FIELD_NAMES.join('|')

// ------- tipoPersonal (GIIS campo 7) -------
// Catálogo TIPO PERSONAL–SIS. Solo los tipos activos en CronosMD.
// Fuente strings: TipoPersonal[] en cronos-frontend/src/scripts/Constants.ts
export const TIPO_PERSONAL: Record<string, number> = {
  'MÉDICA(O) PASANTE': 1,
  'MÉDICA(O) GENERAL': 2,
  'MÉDICA(O) RESIDENTE': 3,
  'MÉDICA(O) ESPECIALISTA': 4,
  'PASANTE DE ENFERMERÍA': 5,
  'ENFERMERA(O)': 6
}

// ------- sexoCURP (GIIS campo 16) -------
// 1=HOMBRE, 2=MUJER, 3=NO BINARIO
// Fuente: type Sex = "Masculino" | "Femenino" | "Intersexual" (globalsCC.d.ts).
// RENAPO sólo codifica H/M en la CURP, así que Intersexual se reporta como
// 3 = NO BINARIO en el campo 16.
export const SEXO_CURP: Record<string, number> = {
  Masculino: 1,
  Femenino: 2,
  Intersexual: 3
}

// ------- sexoBiologico (GIIS campo 17) -------
// 1=HOMBRE, 2=MUJER, 3=INTERSEXUAL
// Misma fuente que sexoCURP.
export const SEXO_BIOLOGICO: Record<string, number> = {
  Masculino: 1,
  Femenino: 2,
  Intersexual: 3
}

// ------- genero (GIIS campo 22) -------
// 0=NO ESPECIFICADO, 1=MASCULINO, 2=FEMENINO, 3=TRANSGÉNERO,
// 4=TRANSEXUAL, 5=TRAVESTI, 6=INTERSEXUAL, 88=OTRO
// El campo genre se extrae de texto clínico libre; se mapean las variantes
// que la IA puede producir.
export const GENERO: Record<string, number> = {
  Masculino: 1,
  masculino: 1,
  Masc: 1,
  masc: 1,
  Hombre: 1,
  hombre: 1,
  Femenino: 2,
  femenino: 2,
  Fem: 2,
  fem: 2,
  Mujer: 2,
  mujer: 2,
  'No Binario': 0,
  'no binario': 0,
  NoBinario: 0,
  Transgénero: 3,
  Transgenero: 3,
  Transexual: 4,
  Travesti: 5,
  Intersexual: 6,
  Otro: 88,
  otro: 88
}

// ------- derechohabiencia (GIIS campo 23) -------
// El catálogo AFILIACION almacena los códigos como strings en MongoDB.
// CronosMD usa el catálogo catalogo-afiliaciones del SIS.
export const DERECHOHABIENCIA_DESCONOCIDA = -1

/**
 * Valor con el que se rellena una columna sin dato.
 *
 * Decisión explícita del usuario (2026-08-22): antes se escribía `-1` en todo
 * hueco. Queda en un solo sitio a propósito, porque la elección NO es inocua:
 * en los catálogos GIIS `-1` suele significar "no aplica" mientras `0` suele
 * ser un valor real —normalmente "NO"—, así que un `0` en una columna que no
 * aplicaba afirma algo en vez de callarlo. Si hay que revertirlo, se cambia
 * este número y nada más.
 */
export const VACIO = 0
