// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import { BadRequest } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

/**
 * PASO 1 del alta: arma el paciente a partir de la ficha de identificación.
 *
 * Con `patientId` el paciente ya existe y no hay nada que construir. Sin él, se
 * traduce `data.patientIdentification` al `personalInfo` que espera el servicio
 * de pacientes y se deja en `params.pendingPatientData`, SIN persistir: los
 * pasos 2 y 3 (identificación y diagnósticos) todavía pueden rechazar el alta.
 *
 * La identificación llega SIEMPRE estructurada desde `PatientIdentityPanel`.
 * Antes existía un extractor por IA que la deducía del texto libre; se eliminó
 * en la purga de Temis, así que un alta sin ese objeto es un error del cliente,
 * no un caso a adivinar.
 */
export const buildPatientFromIdentification = async (context: HookContext) => {
  // Con patientId el paciente ya existe: no hay nada que construir aquí.
  if (context.data.patientId) {
    return context
  }

  const requestData = context.data as any
  const identification = requestData.patientIdentification
  const userLocalizacion = requestData.userLocalizacion
  delete requestData.patientIdentification
  delete requestData.userLocalizacion

  if (!identification) {
    throw new BadRequest(
      'Falta la ficha de identificación del paciente. Complétala antes de guardar el expediente.'
    )
  }

  const birthLocation = identification.nacimientoLocalizacion ?? userLocalizacion?.nacimiento
  const domicileLocation = identification.domicilioLocalizacion ?? userLocalizacion?.domicilio

  const birthPlace = birthLocation?.pais
    ? [birthLocation.estado?.nombre, birthLocation.pais.nombre].filter(Boolean).join(', ')
    : identification.birthPlace

  const personalInfo = {
    names: `${identification.names ?? ''}`.trim().toUpperCase(),
    middleName: `${identification.middleName ?? ''}`.trim().toUpperCase(),
    lastName: `${identification.lastName ?? ''}`.trim().toUpperCase(),
    sex: identification.sex,
    birthDate: identification.birthDate,
    birthPlace,
    domicile: identification.domicile,
    genre: identification.genre,
    derechohabiencia: identification.derechohabiencia,
    curp: identification.curp || 'XXXX999999XXXXXX99',
    seAutodenominaAfromexicano: identification.seAutodenominaAfromexicano,
    seConsideraIndigena: identification.seConsideraIndigena,
    migrante: identification.migrante,
    paisProcedencia: identification.paisProcedencia
  }

  const patientData: Record<string, any> = {
    personalInfo,
    localizacion: {
      ...(birthLocation ? { nacimiento: birthLocation } : {}),
      ...(domicileLocation ? { domicilio: domicileLocation } : {})
    },
    LUID: `${personalInfo.names} ${personalInfo.middleName} ${personalInfo.lastName} ~ ${personalInfo.birthDate} ~ ${personalInfo.birthPlace} ~ ${personalInfo.sex}`
  }

  // No persistir todavía: persistNewPatient es el último paso del flujo.
  context.params.pendingPatientData = patientData
  context.params.patientData = patientData
  context.params.isNewPatient = true

  context.data = {
    ...context.data,
    Temporality: 'PrimeraVez'
    // FirstTimeInYear y ServiceArea ya NO se fuerzan aquí: NOM-024 exige que
    // reflejen la elección real del usuario en el formulario, no un default.
  }

  return context
}
