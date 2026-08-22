// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext } from '../../declarations'
import { Groups } from '../../services/groups/groups.class'
import { GeneralError } from '@feathersjs/errors'

export const populate_patients = async (context: HookContext) => {
  if (context.params.query.populatePatients) {
    const retrievedGroup = context.result as Groups

    //  Si no se encuentra el grupo regresar Error
    if (!retrievedGroup) {
      throw new GeneralError('No se econtró ese folder')
    }

    context.params.query.group_patients = retrievedGroup.patients
    // Obtener toda la información del pacientes del Grupo
    const RetrievedPatients = (await context.app.service('patients').get('groupRequest', context.params)).data

    const ReturnPatientData = {
      ...retrievedGroup,
      patients: RetrievedPatients
    }

    // console.log(ReturnPatientData)

    context.result = ReturnPatientData

    // return ReturnPatientData
  }

  return context
}
