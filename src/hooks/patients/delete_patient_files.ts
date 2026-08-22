// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../../declarations'

export const delete_patient_files = async (context: HookContext) => {
  const { app } = context

  //  -------------- Find And Delete all Records associated with the deleted Patient -----------------------

  try {
    const recordsIdList = await app.service('records').find({
      query: { patientId: context.id },
      paginate: false
    })

    recordsIdList.forEach(async (record) => {
      await app.service('records').remove(`${record._id}`)
    })
  } catch (error) {
    console.error(`No Records of patientID found: ${context.id}`, error)
  }

  // //  -------------- Find And Delete all Somas associated with the deleted Patient -----------------------

  try {
    const somasIdList = await app.service('somas').find({
      query: { patientId: context.id },
      paginate: false
    })

    somasIdList.forEach(async (soma) => {
      await app.service('somas').remove(`${soma._id}`)
    })
  } catch (error) {
    console.error(`No Somas of patientID found: ${context.id}`, error)
  }

  // //  -------------- Find And Delete all Labs associated with the deleted Patient -----------------------

  try {
    const labsIdList = await app.service('labs').find({
      query: { patientId: context.id },
      paginate: false
    })

    labsIdList.forEach(async (lab) => {
      await app.service('labs').remove(`${lab._id}`)
    })
  } catch (error) {
    console.error(`No Labs of patientID found: ${context.id}`, error)
  }

  // //  -------------- Find And Delete all Drugs associated with the deleted Patient -----------------------

  try {
    const drugsIdList = await app.service('drugs').find({
      query: { patientId: context.id },
      paginate: false
    })

    drugsIdList.forEach(async (drug) => {
      await app.service('drugs').remove(`${drug._id}`)
    })
  } catch (error) {
    console.error(`No Drugs of patientID found: ${context.id}`, error)
  }

  // //  -------------- Find And Delete all Images associated with the deleted Patient -----------------------

  try {
    const imgsIdList = await app.service('imgs').find({
      query: { patientId: context.id },
      paginate: false
    })

    imgsIdList.forEach(async (img) => {
      await app.service('imgs').remove(`${img._id}`)
    })
  } catch (error) {
    console.error(`No Imgs of patientID found: ${context.id}`, error)
  }

  return context
}
