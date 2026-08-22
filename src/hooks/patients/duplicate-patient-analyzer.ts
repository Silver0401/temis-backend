// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import { GeneralError } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'
import { Patients } from '../../client'

export const duplicatePatientAnalyzer = async (context: HookContext) => {
  // Entonces la solución parece crear un LUID (Local Unique Identifier) que tenga toda la información del paciente (Nombre, Sexo, Fecha de Nacimiento, Lugar de Nacimiento). Posteriormente antes de añadir un nuevo paciente, utilizar un algoritmo (ya sea el de jaro winkler o el de leveshtein) para definir el porcentaje o probabilidad de que el LUID de un paciente que se quiera añadir ya exista en la base de datos. Dependiendo del porcentaje arrojado, dar diferentes opciones (no hacer nada si es muy bajo, si es medio que la analize un Humano en el front, si es alto que lo analize una IA para confirmar que ya existe)
  const response = context.data as Patients

  const PatientIsPossiblySame = (name1: string, name2: string): boolean => {
    let NumberOfCorrectCharacters = 0
    let Attempt2NumberOfCorrectCharacters = 0

    const loweredName1 = name1.toLowerCase()
    const loweredName2 = name2.toLowerCase()
    // console.log(loweredName1)
    // console.log(loweredName2)

    let firstErrorCharIndex: number | undefined = undefined
    loweredName1.split('').map((letter: string, index: number) => {
      if (letter === loweredName2.charAt(index)) {
        NumberOfCorrectCharacters++
      } else {
        if (firstErrorCharIndex === undefined) {
          firstErrorCharIndex = index
        }
      }
    })

    if (firstErrorCharIndex) {
      ;(
        loweredName1.substring(0, firstErrorCharIndex) +
        loweredName1.substring(firstErrorCharIndex + 1, loweredName1.length)
      )
        .split('')
        .map((letter: string, index: number) => {
          if (letter === loweredName2.charAt(index)) {
            Attempt2NumberOfCorrectCharacters++
          }
        })
    }

    // console.log(NumberOfCorrectCharacters / loweredName1.length)
    // console.log(Attempt2NumberOfCorrectCharacters / loweredName1.length)

    if (
      (NumberOfCorrectCharacters / loweredName1.length) * 100 === 1 ||
      ((NumberOfCorrectCharacters / loweredName1.length) * 100 < 70 &&
        (Attempt2NumberOfCorrectCharacters / loweredName1.length) * 100 < 70)
    ) {
      return false
    } else {
      return true
    }
  }

  // Función para validar una CURP
  function validarCURP(curp: string) {
    // Expresión regular para validar la estructura de la CURP
    const regex =
      /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/
    const validado = curp.match(regex)

    if (!validado) {
      // La CURP no coincide con el formato general
      return false
    }

    // Función para calcular el dígito verificador
    function calcularDigitoVerificador(curp17: string) {
      const diccionario = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
      let suma = 0
      for (let i = 0; i < 17; i++) {
        suma += diccionario.indexOf(curp17.charAt(i)) * (18 - i)
      }
      const digitoVerificador = 10 - (suma % 10)
      return digitoVerificador === 10 ? 0 : digitoVerificador
    }

    // Validar el dígito verificador
    if (parseInt(validado[2]) !== calcularDigitoVerificador(validado[1])) {
      return false
    }

    return true
  }

  // Verificar los Datos Extraidos en Formato JSON
  // if (completion.choices[0].message.refusal) {
  //   console.log(completion.choices[0].message.refusal)
  //   throw new GeneralError(`Error: ${completion.choices[0].message.refusal}`)
  // } else {
  // const response = completion.choices[0].message.parsed
  // const missingDataList: string[] = []
  // console.log(response)

  const possibleDuplicatePatientsList = await context.app.get('mongodbClient').then((db) =>
    db
      .collection('patients')
      .aggregate([
        {
          $search: {
            index: 'LUID_search',
            autocomplete: {
              query: `${response.personalInfo.names} ${response.personalInfo.middleName} ${response.personalInfo.lastName}`,
              path: 'LUID',
              fuzzy: {
                maxEdits: 2
              }
            }
          }
        }
      ])
      .toArray()
  )

  const patientIdentifiers = possibleDuplicatePatientsList.map((patientData): [string, string] => {
    return [patientData.LUID, patientData._id]
  })

  if (patientIdentifiers.length > 0) {
    patientIdentifiers.map(([patientLUID, patientId]) => {
      if (PatientIsPossiblySame(patientLUID, response.LUID)) {
        throw new GeneralError(`DupPatient ; ${patientId}`, {
          patientFile: possibleDuplicatePatientsList.filter(
            (patient) => patient.LUID === patientIdentifiers[0]
          )[0]
        })
      }
    })
  }

  return context
}
