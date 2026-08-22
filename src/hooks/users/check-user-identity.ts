// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import { GeneralError } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'
import axios, { AxiosResponse } from 'axios'

interface INE_OCR_data_props {
  front: FrontProps
  back: BackProps
}

interface MRZProps {
  tipo_identificacion?: string
  cic?: string
  identificador_del_ciudadano?: string
  ocr?: string
  clave_de_elector?: string
  numero_de_emision?: string
}

const coso = [
  {
    nombre: 'RICARDO TREVIÑO GONZÁLEZ',
    numCedula: '0069652',
    profesion: 'LICENCIATURA EN INGENIERÍA CIVIL',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN',
    fechaRegistro: '1958',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO TREVIÑO GONZÁLEZ',
    numCedula: '0392210',
    profesion: 'LICENCIATURA EN ADMINISTRACIÓN DE EMPRESAS',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS',
    fechaRegistro: '1976',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'JOSÉ RICARDO TREVIÑO GONZÁLEZ',
    numCedula: '0758741',
    profesion: 'LICENCIATURA COMO CONTADOR PÚBLICO Y AUDITOR',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN',
    fechaRegistro: '1982',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'ISMAEL MUÑOZ CONTRERAS',
    numCedula: '1097192',
    profesion: 'LICENCIATURA EN PSICOLOGÍA',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD REGIOMONTANA',
    fechaRegistro: '1986',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO TREVIÑO GONZALEZ',
    numCedula: '13167243',
    profesion: 'LICENCIATURA EN INGENIERÍA INDUSTRIAL',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD TECNOLÓGICA LATINOAMERICANA EN LÍNEA',
    fechaRegistro: '2022',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'FERNANDO RICARDO TREVIÑO GONZALEZ',
    numCedula: '14171865',
    profesion: 'LICENCIATURA EN EDUCACIÓN MEDIA EN LA ESP. DE INGLÉS Y FRANCÉS',
    genero: 'HOMBRE',
    institucion: 'ESCUELA NORMAL SUPERIOR "PROFR. MOISES SAENZ GARZA"',
    fechaRegistro: '2024',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'ISMAEL MUÑOZ CONTRERAS',
    numCedula: '1895136',
    profesion: 'LICENCIATURA COMO MÉDICO CIRUJANO',
    genero: 'HOMBRE',
    institucion: 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY',
    fechaRegistro: '1993',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO TREVIÑO GONZÁLEZ',
    numCedula: '3389187',
    profesion: 'LICENCIATURA EN INGENIERÍA INDUSTRIAL',
    genero: 'HOMBRE',
    institucion: 'INSTITUTO TECNOLÓGICO DE VERACRUZ (I.T.R.)',
    fechaRegistro: '2001',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO MANUEL TREVIÑO GONZALEZ',
    numCedula: '3688705',
    profesion: 'LICENCIATURA EN DERECHO',
    genero: 'HOMBRE',
    institucion: 'ESCUELA LIBRE DE DERECHO DE PUEBLA, A.C.',
    fechaRegistro: '2002',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'FERNANDO RICARDO TREVIÑO GONZALEZ',
    numCedula: '5285316',
    profesion: 'LICENCIATURA EN DERECHO Y CIENCIAS SOCIALES',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN',
    fechaRegistro: '2007',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO JORGE TREVIÑO GONZÁLEZ',
    numCedula: '5941688',
    profesion: 'LICENCIATURA EN DERECHO',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE COAHUILA',
    fechaRegistro: '2009',
    tipo: 'C1',
    estado: ''
  },
  {
    nombre: 'RICARDO TREVIÑO GONZALEZ',
    numCedula: '6959534',
    profesion: 'LICENCIATURA EN CIENCIAS COMPUTACIONALES',
    genero: 'HOMBRE',
    institucion: 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN',
    fechaRegistro: '2011',
    tipo: 'C1',
    estado: ''
  }
]

const NameVerifier = (name1: string, name2: string, type: 'INE' | 'Cédula Profesional') => {
  let NumberOfCorrectCharacters = 0
  let Attempt2NumberOfCorrectCharacters = 0

  const loweredName1 = name1.toLowerCase()
  const loweredName2 = name2.toLowerCase()

  // console.log('---- Nombres ----')
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

  console.log(NumberOfCorrectCharacters / loweredName1.length)
  console.log(Attempt2NumberOfCorrectCharacters / loweredName1.length)

  if (
    (NumberOfCorrectCharacters / loweredName1.length) * 100 < 85 &&
    (Attempt2NumberOfCorrectCharacters / loweredName1.length) * 100 < 85
  ) {
    throw new GeneralError(`El nombre que escribiste no concuerda con el de tu ${type}`)
  }
}

const NameIsPossiblySame = (name1: string, name2: string): boolean => {
  let NumberOfCorrectCharacters = 0
  let Attempt2NumberOfCorrectCharacters = 0

  const loweredName1 = name1.toLowerCase()
  const loweredName2 = name2.toLowerCase()
  console.log(loweredName1)
  console.log(loweredName2)

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

  console.log(NumberOfCorrectCharacters / loweredName1.length)
  console.log(Attempt2NumberOfCorrectCharacters / loweredName1.length)

  if (
    (NumberOfCorrectCharacters / loweredName1.length) * 100 < 85 &&
    (Attempt2NumberOfCorrectCharacters / loweredName1.length) * 100 < 85
  ) {
    return false
  } else {
    return true
  }
}

const CreateRandomBirthate = (): string => {
  const start = new Date(1950, 0, 1)
  const end = new Date(2002, 0, 1)
  const birthdate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return `${birthdate.getDate()}/${birthdate.getMonth() + 1}/${birthdate.getFullYear()}`
}

const CreateRandomCURP = (): string => {
  const vowels = 'AEIOU'
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const stateCodes = [
    'AS', 'BC', 'BS', 'CC', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR',
    'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT',
    'QR', 'SP', 'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS'
  ]
  const rand = (str: string) => str[Math.floor(Math.random() * str.length)]
  const randFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

  // Posiciones 1-4: letras derivadas del nombre
  const p1 = rand(letters)   // Primera letra del apellido paterno
  const p2 = rand(vowels)    // Primera vocal interna del apellido paterno
  const p3 = rand(letters)   // Primera letra del apellido materno
  const p4 = rand(letters)   // Primera letra del nombre

  // Posiciones 5-10: fecha de nacimiento AAMMDD
  const birthYear = Math.floor(Math.random() * 74) + 1950  // 1950–2023
  const birthMonth = Math.floor(Math.random() * 12) + 1
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate()
  const birthDay = Math.floor(Math.random() * daysInMonth) + 1
  const yy = String(birthYear).slice(-2)
  const mm = String(birthMonth).padStart(2, '0')
  const dd = String(birthDay).padStart(2, '0')

  // Posición 11: sexo
  const sex = Math.random() < 0.5 ? 'H' : 'M'

  // Posiciones 12-13: entidad federativa
  const state = randFrom(stateCodes)

  // Posiciones 14-16: primera consonante interna de cada componente del nombre
  const p14 = rand(consonants)
  const p15 = rand(consonants)
  const p16 = rand(consonants)

  // Posición 17: diferenciador homónimo (dígito si nació antes de 2000, letra si 2000+)
  const p17 = birthYear < 2000
    ? String(Math.floor(Math.random() * 10))
    : rand(letters)

  const curpBase = `${p1}${p2}${p3}${p4}${yy}${mm}${dd}${sex}${state}${p14}${p15}${p16}${p17}`

  // Posición 18: dígito verificador (algoritmo RENAPO)
  const charValue: Record<string, number> = {
    '0': 0,  '1': 1,  '2': 2,  '3': 3,  '4': 4,
    '5': 5,  '6': 6,  '7': 7,  '8': 8,  '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14,
    'F': 15, 'G': 16, 'H': 17, 'I': 18, 'J': 19,
    'K': 20, 'L': 21, 'M': 22, 'N': 23, 'Ñ': 24,
    'O': 25, 'P': 26, 'Q': 27, 'R': 28, 'S': 29,
    'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34,
    'Y': 35, 'Z': 36
  }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += (charValue[curpBase[i]] ?? 0) * (18 - i)
  }
  const verificationDigit = (10 - (sum % 10)) % 10

  return `${curpBase}${verificationDigit}`
}

export const checkUserIdentity = async (context: HookContext) => {
  // Context Request Data
  const userName: string = context.arguments[0].name.toLowerCase().trim()
  const userMedicalLicense = context.arguments[0].medicalLicenses[0].id
  const userProfessionType = context.arguments[0].professionType

  // CE-01 to CE-04: campos estructurados de nombre y CURP del prestador
  context.data.nombrePrestador = (context.arguments[0].nombre ?? '').toUpperCase()
  context.data.primerApellidoPrestador = (context.arguments[0].primerApellido ?? '').toUpperCase()
  context.data.segundoApellidoPrestador = (context.arguments[0].segundoApellido ?? '').toUpperCase()
  context.data.curpPrestador = (context.arguments[0].curpPrestador ?? '').toUpperCase()

  delete context.data.nombre
  delete context.data.primerApellido
  delete context.data.segundoApellido
  delete context.data.nufiPreVerified
  delete context.data.nufiData

  if (process.env.ENV_TYPE === 'production') {
    const nufiPreVerified: boolean = !!context.arguments[0].nufiPreVerified

    // --- Step 1 & 2 bypass: NUFI ya corrió en verify-nufi service ---
    if (nufiPreVerified) {
      const nd = context.arguments[0].nufiData
      context.data.personalInfo = {
        sex: nd.sex,
        birthDate: nd.birthDate,
        birthPlace: nd.birthPlace,
        domicile: nd.domicile,
        curp: nd.curp
      }
      context.data.UID = {
        ...context.data.UID,
        validity: nd.vigencia,
        model: nd.model,
        mrz: nd.mrz
      }
      if (context.arguments[0].birthLocalizacion) {
        context.data.birthLocalizacion = context.arguments[0].birthLocalizacion
      }
      if (context.arguments[0].residenceLocalizacion) {
        context.data.residenceLocalizacion = context.arguments[0].residenceLocalizacion
      }

      // Step 3 — Cédula (solo si no es pasante)
      const allSpecialtiesFound: Array<{ type: string; id: number }> = []

      if (context.data.professionType !== 'MÉDICA(O) PASANTE') {
        const nameAbstracted = {
          nombre: (context.arguments[0].nombre as string | undefined)?.toLowerCase()
            ?? (userName.split(' ').length === 4
              ? `${userName.split(' ')[0]} ${userName.split(' ')[1]}`
              : userName.split(' ')[0]),
          apellido_paterno: (context.arguments[0].primerApellido as string | undefined)?.toLowerCase()
            ?? (userName.split(' ').length === 4 ? userName.split(' ')[2] : userName.split(' ')[1]),
          apellido_materno: (context.arguments[0].segundoApellido as string | undefined)?.toLowerCase()
            ?? (userName.split(' ').length === 4 ? userName.split(' ')[3] : userName.split(' ')[2])
        }

        await axios({
          method: 'post',
          url: 'https://nufi.azure-api.net/CedulaProfesional/consultar',
          data: nameAbstracted,
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.NOT_NUFI_AI_KEY
          }
        })
          .then((response) => {
            let MedicalLicenseFound = false
            response.data.data.map((personUID: any) => {
              if (NameIsPossiblySame(userName, personUID.nombre)) {
                allSpecialtiesFound.push({ type: personUID.numCedula, id: personUID.profesion })
              }
              if (`${userMedicalLicense}`.trim() === `${personUID.numCedula}`.trim()) {
                MedicalLicenseFound = true
                NameVerifier(userName, personUID.nombre, 'Cédula Profesional')
                if (userProfessionType === 'Médico Cirujano' && !personUID.profesion.includes('MÉDICO CIRUJANO')) {
                  throw new GeneralError('La cédula No es de médico cirujano / general')
                }
                if (userProfessionType === 'Lic. en Nutrición' && !personUID.profesion.includes('NUTRICIÓN')) {
                  throw new GeneralError('La cédula No es de lic. en nutrición')
                }
              }
            })
            if (!MedicalLicenseFound) {
              throw new GeneralError('No se encontró esa cédula profesional')
            }
          })
          .catch((err) => {
            console.error(err)
            throw new GeneralError('Error validando Cédula Profesional')
          })
      }

      context.data.medicalLicenses = allSpecialtiesFound
      return context
    }

    // --- Flujo completo NUFI (sin pre-verificación) ---
    const INE_base64_photos = {
      credencial_frente: context.arguments[0].UID.frontImg,
      credencial_reverso: context.arguments[0].UID.reverseImg,
      imagen_rostro: context.arguments[0].UID.faceImg
    }

    let INE_OCR_data: INE_OCR_data_props = {
      front: {},
      back: {}
    }

    // ----------------------------------------------------------------------------

    // Testing Space

    // throw new GeneralError('Error extrayendo información de la INE')

    // ----------------------------------------------------------------------------

    //  Step 1) UID validity: Extracción de Datos y Verificación de que la INE es valida a dia de hoy

    // 1.1 -> Extraer la Información del Frente de la Tarjeta
    const FrontINEPromse = new Promise<AxiosResponse<{ data: FrontProps }, any>>(async (resolve, _reject) => {
      resolve(
        await axios({
          method: 'post',
          url: 'https://nufi.azure-api.net/ocr/v4/frente',
          data: { base64_credencial_frente: INE_base64_photos.credencial_frente },
          headers: {
            'Content-Type': 'application/json',
            'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
          }
        })
      )
    })

    // 1.2 -> Extraer la Información del Reverso de la Tarjeta
    const BackINEPromse = new Promise<AxiosResponse<{ data: BackProps }, any>>(async (resolve, _reject) => {
      resolve(
        await axios({
          url: 'https://nufi.azure-api.net/ocr/v4/reverso',
          method: 'post',
          data: {
            base64_credencial_reverso: INE_base64_photos.credencial_reverso
          },
          headers: {
            'Content-Type': 'application/json',
            'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
          }
        })
      )
    })

    //   1.3 -> Call All Promises (Back and Front Scannning)
    await Promise.all([BackINEPromse, FrontINEPromse])
      .then((promiseArray) => {
        const [backINEResponse, frontINEResponse] = promiseArray
        INE_OCR_data = {
          ...INE_OCR_data,
          back: {
            ...backINEResponse.data.data
          },
          front: {
            ...frontINEResponse.data.data
          }
        }
      })
      .catch((err) => {
        console.error(err)
        throw new GeneralError('Error extrayendo información de la INE, toma las fotos de nuevo')
      })

    // OCR de la INE contiene PII (nombre, CURP, domicilio): no se registra.

    // 1.4 -> Verificar que si se pude leear y extraer la información del INE (ambos lados)
    if (INE_OCR_data.front.ocr?.nombre === undefined) {
      throw new GeneralError('La imágen del INE frontal salio de mala calidad, toma una foto nueva')
    }
    if (INE_OCR_data.back.ocr?.mrz === undefined) {
      throw new GeneralError('La imágen del reverso del INE salio de mala calidad, toma una foto nueva')
    }

    // 1.4 -> Validar si El Nombre escrito y el de la INE es el mismo
    const OCR_retrieved_name =
      `${INE_OCR_data.front.ocr?.nombre} ${INE_OCR_data.front.ocr?.apellido_paterno} ${INE_OCR_data.front.ocr?.apellido_materno}`
        .toLowerCase()
        .trim()

    NameVerifier(userName, OCR_retrieved_name, 'INE')

    // 1.6 -> Validar datos de la INE en Lista Nominal

    const TipoDeId = INE_OCR_data.back.ocr?.model?.slice(-1)

    let INEFormatedMRZ: MRZProps = {}

    if (TipoDeId === 'C') {
      INEFormatedMRZ = {
        tipo_identificacion: INE_OCR_data.back.ocr?.model?.slice(-1),
        ocr: `${INE_OCR_data.back.ocr?.mrz}`,
        clave_de_elector: INE_OCR_data.front.ocr?.clave,
        numero_de_emision: INE_OCR_data.front.ocr.emision?.slice(-2)
      }
    } else if (TipoDeId === 'D') {
      INEFormatedMRZ = {
        tipo_identificacion: INE_OCR_data.back.ocr?.model?.slice(-1),
        cic: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[0]}`.match(/\d+/g)?.join('').substring(0, 9),
        ocr: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.split(' ')[0]
      }
    } else {
      INEFormatedMRZ = {
        tipo_identificacion: INE_OCR_data.back.ocr?.model?.slice(-1),
        cic: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[0]}`.match(/\d+/g)?.join('').substring(0, 9),
        identificador_del_ciudadano: INE_OCR_data.back.ocr?.mrz?.includes('<<')
          ? `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.split(' ')[0].substring(13 - 9)
          : INE_OCR_data.back.ocr?.mrz
      }
    }

    // const INEFormatedMRZ: MRZProps = {
    //   tipo_identificacion: INE_OCR_data.back.ocr?.model?.slice(-1),

    //   ocr: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.split(' ')[0],
    //   clave_de_elector: INE_OCR_data.front.ocr?.clave,
    //   numero_de_emision: `${INE_OCR_data.back.ocr?.mrz?.split('<<')[1]}`.substring(
    //     //  @ts-ignore
    //     INE_OCR_data.back.ocr?.mrz?.split('<<')[1].length - 2
    //   )
    // }

    // if (INEFormatedMRZ.tipo_identificacion === 'D') {
    //   delete INEFormatedMRZ.identificador_del_ciudadano
    //   delete INEFormatedMRZ.numero_de_emision
    //   delete INEFormatedMRZ.clave_de_elector
    // } else if (INEFormatedMRZ.tipo_identificacion === 'C') {
    //   delete INEFormatedMRZ.cic
    //   delete INEFormatedMRZ.identificador_del_ciudadano
    // } else if (
    //   INEFormatedMRZ.tipo_identificacion === 'E' ||
    //   INEFormatedMRZ.tipo_identificacion === 'F' ||
    //   INEFormatedMRZ.tipo_identificacion === 'G' ||
    //   INEFormatedMRZ.tipo_identificacion === 'H'
    // ) {
    //   delete INEFormatedMRZ.numero_de_emision
    //   delete INEFormatedMRZ.clave_de_elector
    //   delete INEFormatedMRZ.ocr
    // } else {
    //   throw new GeneralError('Ese tipo de INE ya no es válida')
    // }

    console.log(INEFormatedMRZ)

    await axios({
      url: 'https://nufi.azure-api.net/v1/lista_nominal/validar',
      method: 'post',
      data: INEFormatedMRZ,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.NOT_NUFI_AI_KEY
      }
    })
      .then((response) => {
        console.log(response.data.data[0])
        if (!response.data.data[0].activa) {
          throw new GeneralError('INE no validada en lista Nominal')
        } else {
          console.log('INE validada en list Nominal: true')
          throw new GeneralError(response.data.data[0].information)
        }
      })
      .catch((err) => {
        console.error(err)
        throw new GeneralError('Error validando INE en lista Nominal')
      })

    console.log('Step 1.4 - 1.6) Data Validation and Lista Nominal (3$)')
    console.log('--------------------------------------------------')
    console.log(INEFormatedMRZ)
    console.log('--------------------------------------------------')

    // Step 2) Biometric Comparation: Verificar que la cara de la INE es la misma persona que la de la cámara

    await axios({
      url: 'https://nufi.azure-api.net/biometrico/v2/ine_vs_selfie',
      method: 'post',
      data: INE_base64_photos,
      headers: {
        'Content-Type': 'application/json',
        'NUFI-API-KEY': process.env.NOT_NUFI_AI_KEY
      }
    })
      .then((response) => {
        if (!response.data.data.resultado_verificacion_rostro) {
          throw new GeneralError('Tu cara no concuerda con la de tu INE')
        }
      })
      .catch((err) => {
        console.error(err)
        throw new GeneralError('Error verificando caras de INE y persona')
      })

    console.log('Step 2) Comparación biométrica (3$)')
    console.log('--------------------------------------------------')
    console.log('Verificado: true')
    console.log('--------------------------------------------------')

    // Step 3) UID comparison: Verificiar que la Cédula Profesional corresponde al nombre de la Persona
    const allSpecialtiesFound: Array<{ type: string; id: number }> = []

    if (context.data.professionType !== 'MÉDICA(O) PASANTE') {
      const nameAbstracted = {
        nombre: (context.arguments[0].nombre as string | undefined)?.toLowerCase()
          ?? (userName.split(' ').length === 4
            ? `${userName.split(' ')[0]} ${userName.split(' ')[1]}`
            : userName.split(' ')[0]),
        apellido_paterno: (context.arguments[0].primerApellido as string | undefined)?.toLowerCase()
          ?? (userName.split(' ').length === 4 ? userName.split(' ')[2] : userName.split(' ')[1]),
        apellido_materno: (context.arguments[0].segundoApellido as string | undefined)?.toLowerCase()
          ?? (userName.split(' ').length === 4 ? userName.split(' ')[3] : userName.split(' ')[2])
      }

      await axios({
        method: 'post',
        url: 'https://nufi.azure-api.net/CedulaProfesional/consultar',
        data: nameAbstracted,
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.NOT_NUFI_AI_KEY
        }
      })
        .then((response) => {
          // console.log(response.data.data)
          let MedicalLicenseFound = false

          // coso.map((personUID: any) => {
          response.data.data.map((personUID: any) => {
            // console.log(userMedicalLicense)
            // console.log(personUID.numCedula)

            if (NameIsPossiblySame(userName, personUID.nombre)) {
              allSpecialtiesFound.push({
                type: personUID.numCedula,
                id: personUID.profesion
              })
            }

            if (`${userMedicalLicense}`.trim() === `${personUID.numCedula}`.trim()) {
              MedicalLicenseFound = true

              NameVerifier(userName, personUID.nombre, 'Cédula Profesional')

              if (
                userProfessionType === 'Médico Cirujano' &&
                !personUID.profesion.includes('MÉDICO CIRUJANO')
              ) {
                throw new GeneralError('La cédula No es de médico cirujano / general')
              }
              if (userProfessionType === 'Lic. en Nutrición' && !personUID.profesion.includes('NUTRICIÓN')) {
                throw new GeneralError('La cédula No es de lic. en nutrición')
              }
            }
          })

          if (!MedicalLicenseFound) {
            throw new GeneralError('No se encontró esa cédula profesional')
          }
        })
        .catch((err) => {
          console.error(err)
          throw new GeneralError('Error validando Cédula Profesional')
        })

      console.log('Step 3) Busqueda y Verificación de Cédula Profesional (3$)')
      console.log('--------------------------------------------------')
      console.log('Verificado: true')
      console.log('--------------------------------------------------')
    }

    // Si se completaron todas las validaciones ahora si registramos al usuario

    console.log('--------------------------------------------------')
    console.log('PROCESO COMPLETADO, Usuario Verificado con Éxito')
    console.log('--------------------------------------------------')

    // Guardar Información (Datos Personales, Cédulas Médicas y Datos de la INE)
    context.data.personalInfo = {
      sex: INE_OCR_data.front.ocr.sexo?.toLowerCase().includes('h') ? 'Masculino' : 'Femenino',
      birthDate: INE_OCR_data.front.ocr.fecha_nacimiento,
      birthPlace: `${INE_OCR_data.front.ocr.estado}, ${INE_OCR_data.front.ocr.municipio}`,
      domicile: `${INE_OCR_data.front.ocr.calle_numero}; ${INE_OCR_data.front.ocr.colonia}; ${INE_OCR_data.front.ocr.localidad}; ${INE_OCR_data.front.ocr.municipio}; ${INE_OCR_data.front.ocr.codigo_postal};`,
      curp: INE_OCR_data.front.ocr.curp
    }

    context.data.UID = {
      ...context.data.UID,
      validity: INE_OCR_data.front.ocr.vigencia,
      model: INE_OCR_data.back.ocr?.model?.slice(-1),
      mrz: INE_OCR_data.back.ocr.mrz
    }

    context.data.medicalLicenses = allSpecialtiesFound
  } else {
    context.data.UID = {
      type: 'test',
      frontImg: 'test',
      reverseImg: 'test',
      faceImg: 'test',
      validity: 'test',
      model: 'test',
      mrz: 'test'
    }

    context.data.personalInfo = {
      sex: ['Masculino', 'Femenino'][Math.floor(Math.random() * 2)],
      birthDate: CreateRandomBirthate(),
      birthPlace: 'Hidalgo, Pachuca',
      domicile: 'Topacio 208, Col. Punta Azul Pachuca, Hidalgo',
      curp: CreateRandomCURP()
    }
  }

  return context
}
