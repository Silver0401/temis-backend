/**
 * Fixtures para tests de validadores GIIS.
 *
 * noteStrings: texto libre que se pasaría a hospital-ids-retriever (context.params.FilteredId)
 * validPersonalInfos: objetos ya estructurados (salida de hospital-ids-retriever) listos para giis-patient-validator
 */

// ---------------------------------------------------------------------------
// Strings crudos de fichas de identificación hospitalaria
// ---------------------------------------------------------------------------

export const noteStrings = {
  /** Paciente completo con CURP válida */
  pacienteCompleto: `
FICHA DE IDENTIFICACIÓN
Nombre: Juan Carlos
Apellido Paterno: García
Apellido Materno: Ramírez
Fecha de nacimiento: 01/01/1985
Sexo: Masculino
CURP: GARJ850101HMCRMC01
País de nacimiento: México
Entidad de nacimiento: Nuevo León
Identidad de género: Masculino
Derechohabiencia: IMSS
No. de Cama: 25
No. de Expediente: 1234567
`.trim(),

  /** Paciente sin CURP — se usará la genérica GIIS */
  pacienteSinCURP: `
FICHA DE IDENTIFICACIÓN
Nombre: María Elena
Apellido Paterno: López
Apellido Materno: Sánchez
Fecha de nacimiento: 15/06/1990
Sexo: Femenino
CURP: No disponible
País de nacimiento: México
Entidad de nacimiento: Jalisco
Identidad de género: Femenino
Derechohabiencia: Seguro Popular
No. de Cama: 10
No. de Expediente: 9876543
`.trim(),

  /** Paciente extranjero sin CURP */
  pacienteExtranjero: `
FICHA DE IDENTIFICACIÓN
Nombre: Carlos Alberto
Apellido Paterno: Reyes
Apellido Materno: Mendoza
Fecha de nacimiento: 22/03/1978
Sexo: Masculino
CURP: N/A (paciente extranjero)
País de nacimiento: Colombia
Entidad de nacimiento: Bogotá
Identidad de género: Masculino
Derechohabiencia: Particular
No. de Cama: 5
No. de Expediente: 5551234
`.trim(),

  /** Paciente con género no binario / transgénero */
  pacienteTransgenero: `
FICHA DE IDENTIFICACIÓN
Nombre: Alex
Apellido Paterno: Morales
Apellido Materno: Fuentes
Fecha de nacimiento: 10/11/2000
Sexo: Femenino (CURP)
CURP: MOFX001110MDFRNL09
País de nacimiento: México
Entidad de nacimiento: Ciudad de México
Identidad de género: Transgénero
Derechohabiencia: ISSSTE
No. de Cama: 3
No. de Expediente: 3334567
`.trim()
}

// ---------------------------------------------------------------------------
// Objetos estructurados — salida esperada de hospital-ids-retriever
// (estos van a context.data.personalInfo o context.params.patientData.personalInfo)
// ---------------------------------------------------------------------------

export const validPersonalInfos = {
  /** Paciente masculino con CURP real válida */
  masculinoConCURP: {
    names: 'JUAN CARL4OS',
    middleName: 'GARCIA',
    lastName: 'RAMIREZ',
    birthDate: '01/01/1985',
    sex: 'Masc',
    curp: 'GARJ850101HMCRMC01',
    birthCountry: 'México',
    birthEntity: 'Nuevo León',
    genre: 'masculino',
    derechohabiencia: 'IMSS'
  },

  /** Paciente femenina con CURP real válida */
  femeninaConCURP: {
    names: 'MARIA ELENA',
    middleName: 'LOPEZ',
    lastName: 'SANCHEZ',
    birthDate: '15/06/1990',
    sex: 'Fem',
    curp: 'LOSM900615MJCPNR05',
    birthCountry: 'México',
    birthEntity: 'Jalisco',
    genre: 'femenino',
    derechohabiencia: 'Seguro Popular'
  },

  /** Paciente con CURP genérica (sin CURP disponible — norma GIIS) */
  sinCURP: {
    names: 'CARLOS ALBERTO',
    middleName: 'REYES',
    lastName: 'MENDOZA',
    birthDate: '22/03/1978',
    sex: 'Masc',
    curp: 'XXXX999999XXXXXX99',
    birthCountry: 'Colombia',
    birthEntity: 'Bogotá',
    genre: 'masculino',
    derechohabiencia: 'Particular'
  },

  /** Paciente transgénero */
  transgenero: {
    names: 'ALEX',
    middleName: 'MORALES',
    lastName: 'FUENTES',
    birthDate: '10/11/2000',
    sex: 'Fem',
    curp: 'MOFX001110MDFRNL09',
    birthCountry: 'México',
    birthEntity: 'Ciudad de México',
    genre: 'transgénero',
    derechohabiencia: 'ISSSTE'
  },

  /** Paciente con apellidos "XX" (sin apellido registrado) */
  apellidosXX: {
    names: 'ROSA',
    middleName: 'XX',
    lastName: 'XX',
    birthDate: '05/05/1995',
    sex: 'Fem',
    curp: 'XXRX950505MDFXXX09',
    birthCountry: 'México',
    birthEntity: 'Oaxaca',
    genre: 'femenino',
    derechohabiencia: 'IMSS'
  }
}

// ---------------------------------------------------------------------------
// Helpers para construir mock HookContext
// ---------------------------------------------------------------------------

type PersonalInfo = Record<string, any>

/** Crea un contexto donde el paciente viene en context.data (flujo patients.create) */
export function makeDataContext(personalInfo: PersonalInfo): any {
  return {
    data: { personalInfo },
    params: {}
  }
}

/** Crea un contexto donde el paciente viene en context.params.patientData (flujo records) */
export function makeParamsContext(personalInfo: PersonalInfo): any {
  return {
    data: undefined,
    params: { patientData: { personalInfo } }
  }
}
