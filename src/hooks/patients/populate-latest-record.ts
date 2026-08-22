// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import { Records } from '../../client'
import type { HookContext } from '../../declarations'

export const populateLatestRecord = async (context: HookContext) => {
  const { app } = context

  const LatestRecords = (await app.service('records').find({
    query: { patientId: context.params.user.patientsList },
    //   @ts-ignore
    $sort: {
      _id: -1
    },
    pipeline: [
      {
        $lookup: {
          from: ''
        }
      }
    ]
  })) as Records[]

  context.data = {
    ClinicalHistory: LatestRecords[0].ClinicalHistory,
    Diagnosis: LatestRecords[0].Diagnosis
  }

  return context
}
