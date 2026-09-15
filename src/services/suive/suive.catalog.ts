// Código generado por src/scripts/extract-suive-catalog.ts. No editar a mano.

export interface SuiveDiagnostico {
  /** Clave EPI del catálogo SUIVE. */
  epiClave: number
  /** Nombre tal como lo escribe el catálogo, ya sin marcadores ni códigos. */
  nombre: string
  /** Grupo epidemiológico, con espacios normalizados. */
  grupo: string
  notificacionInmediata: boolean
  estudioEpidemiologico: boolean
  estudioBrote: boolean
  incluye: SuiveCodigo[]
  excluye: SuiveCodigo[]
  /** Texto original de la columna C, para auditar. */
  textoOriginal: string
}

export type SuiveCodigo =
  | { tipo: 'exacto'; clave: string }
  | { tipo: 'rango'; desde: string; hasta: string }

export const suiveCatalog: Record<number, SuiveDiagnostico> = {
  "1": {
    "epiClave": 1,
    "nombre": "CÓLERA",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A00"
      }
    ],
    "excluye": [],
    "textoOriginal": "CÓLERA  ( * + # )  A00"
  },
  "2": {
    "epiClave": 2,
    "nombre": "AMEBIASIS INTESTINAL",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "A060",
        "hasta": "A063"
      },
      {
        "tipo": "exacto",
        "clave": "A069"
      }
    ],
    "excluye": [],
    "textoOriginal": "AMEBIASIS INTESTINAL  A06.0-A06.3, A06.9"
  },
  "3": {
    "epiClave": 3,
    "nombre": "ABSCESO HEPÁTICO AMEBIANO",
    "grupo": "ENFS INFECS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A064"
      }
    ],
    "excluye": [],
    "textoOriginal": "ABSCESO HEPÁTICO AMEBIANO  A06.4"
  },
  "4": {
    "epiClave": 4,
    "nombre": "ASCARIASIS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B77"
      }
    ],
    "excluye": [],
    "textoOriginal": "ASCARIASIS  B77"
  },
  "5": {
    "epiClave": 5,
    "nombre": "SHIGELOSIS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A03"
      }
    ],
    "excluye": [],
    "textoOriginal": "SHIGELOSIS  A03"
  },
  "6": {
    "epiClave": 6,
    "nombre": "FIEBRE TIFOIDEA",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A010"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE TIFOIDEA ( # ) A01.0"
  },
  "7": {
    "epiClave": 7,
    "nombre": "GIARDIASIS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A071"
      }
    ],
    "excluye": [],
    "textoOriginal": "GIARDIASIS  A07.1"
  },
  "8": {
    "epiClave": 8,
    "nombre": "INFECCIONES INTESTINALES POR OTROS ORGANISMOS Y LAS MAL DEFINIDAS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A04"
      },
      {
        "tipo": "rango",
        "desde": "A08",
        "hasta": "A09"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "A080"
      }
    ],
    "textoOriginal": "INFECCIONES INTESTINALES POR OTROS ORGANISMOS Y LAS MAL DEFINIDAS  A04, A08-A09 EXCEPTO A08.0"
  },
  "9": {
    "epiClave": 9,
    "nombre": "INTOXICACIÓN ALIMENTARIA BACTERIANA",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A05"
      }
    ],
    "excluye": [],
    "textoOriginal": "INTOXICACIÓN ALIMENTARIA BACTERIANA  ( # )  A05"
  },
  "10": {
    "epiClave": 10,
    "nombre": "ENTEROBIASIS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B80"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENTEROBIASIS  B80"
  },
  "12": {
    "epiClave": 12,
    "nombre": "TENIASIS",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B68"
      }
    ],
    "excluye": [],
    "textoOriginal": "TENIASIS  B68  "
  },
  "14": {
    "epiClave": 14,
    "nombre": "OTRAS HELMINTIASIS",
    "grupo": "ENFS INFECS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B65",
        "hasta": "B67"
      },
      {
        "tipo": "rango",
        "desde": "B70",
        "hasta": "B76"
      },
      {
        "tipo": "exacto",
        "clave": "B78"
      },
      {
        "tipo": "exacto",
        "clave": "B79"
      },
      {
        "tipo": "rango",
        "desde": "B81",
        "hasta": "B83"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "B73"
      },
      {
        "tipo": "exacto",
        "clave": "B75"
      }
    ],
    "textoOriginal": "OTRAS HELMINTIASIS  B65-B67, B70-B76, B78, B79, B81-B83 EXCEPTO B73 y B75"
  },
  "15": {
    "epiClave": 15,
    "nombre": "FARINGITIS Y AMIGDALITIS ESTREPTOCÓCICAS",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "J020"
      },
      {
        "tipo": "exacto",
        "clave": "J030"
      }
    ],
    "excluye": [],
    "textoOriginal": "FARINGITIS Y AMIGDALITIS ESTREPTOCÓCICAS  J02.0, J03.0"
  },
  "16": {
    "epiClave": 16,
    "nombre": "INFECCIONES RESPIRATORIAS AGUDAS",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "J00",
        "hasta": "J06"
      },
      {
        "tipo": "exacto",
        "clave": "J20"
      },
      {
        "tipo": "exacto",
        "clave": "J21"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "J020"
      },
      {
        "tipo": "exacto",
        "clave": "J030"
      }
    ],
    "textoOriginal": "INFECCIONES RESPIRATORIAS AGUDAS  J00-J06, J20, J21 EXCEPTO J02.0 Y J03.0"
  },
  "17": {
    "epiClave": 17,
    "nombre": "NEUMONÍAS Y BRONCONEUMONÍAS",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "J12",
        "hasta": "J18"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "J182"
      },
      {
        "tipo": "exacto",
        "clave": "J13"
      },
      {
        "tipo": "exacto",
        "clave": "J14"
      }
    ],
    "textoOriginal": "NEUMONÍAS Y BRONCONEUMONÍAS  J12-J18 EXCEPTO J18.2, J13 y J14"
  },
  "18": {
    "epiClave": 18,
    "nombre": "OTITIS MEDIA AGUDA",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "H650",
        "hasta": "H651"
      }
    ],
    "excluye": [],
    "textoOriginal": "OTITIS MEDIA AGUDA  H65.0-H65.1"
  },
  "19": {
    "epiClave": 19,
    "nombre": "TUBERCULOSIS RESPIRATORIA",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "A15",
        "hasta": "A16"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUBERCULOSIS RESPIRATORIA  ( + )  A15-A16"
  },
  "20": {
    "epiClave": 20,
    "nombre": "CANDIDIASIS UROGENITAL",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B373",
        "hasta": "B374"
      }
    ],
    "excluye": [],
    "textoOriginal": "CANDIDIASIS UROGENITAL  B37.3-B37.4"
  },
  "21": {
    "epiClave": 21,
    "nombre": "CHANCRO BLANDO",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A57"
      }
    ],
    "excluye": [],
    "textoOriginal": "CHANCRO BLANDO  A57"
  },
  "22": {
    "epiClave": 22,
    "nombre": "HERPES GENITAL",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A600"
      }
    ],
    "excluye": [],
    "textoOriginal": "HERPES GENITAL  A60.0"
  },
  "23": {
    "epiClave": 23,
    "nombre": "INFECCIÓN GONOCÓCICA DEL TRACTO GENITOURINARIO",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "A540",
        "hasta": "A542"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIÓN GONOCÓCICA DEL TRACTO GENITOURINARIO  A54.0-A54.2"
  },
  "24": {
    "epiClave": 24,
    "nombre": "LINFOGRANULOMA VENÉREO POR CLAMIDIAS",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A55"
      }
    ],
    "excluye": [],
    "textoOriginal": "LINFOGRANULOMA VENÉREO POR CLAMIDIAS  A55"
  },
  "25": {
    "epiClave": 25,
    "nombre": "SÍFILIS ADQUIRIDA",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "A51",
        "hasta": "A53"
      }
    ],
    "excluye": [],
    "textoOriginal": "SÍFILIS ADQUIRIDA  A51-A53"
  },
  "26": {
    "epiClave": 26,
    "nombre": "TRICOMONIASIS UROGENITAL",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A590"
      }
    ],
    "excluye": [],
    "textoOriginal": "TRICOMONIASIS UROGENITAL  A59.0"
  },
  "27": {
    "epiClave": 27,
    "nombre": "DENGUE NO GRAVE",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A970"
      },
      {
        "tipo": "exacto",
        "clave": "A979"
      }
    ],
    "excluye": [],
    "textoOriginal": "DENGUE NO GRAVE  ( + # )  A97.0, A97.9"
  },
  "28": {
    "epiClave": 28,
    "nombre": "PALUDISMO por Plasmodium vivax",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B51"
      }
    ],
    "excluye": [],
    "textoOriginal": "PALUDISMO por Plasmodium vivax  ( + )  B51"
  },
  "29": {
    "epiClave": 29,
    "nombre": "BRUCELOSIS",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A23"
      }
    ],
    "excluye": [],
    "textoOriginal": "BRUCELOSIS ( + # )  A23"
  },
  "30": {
    "epiClave": 30,
    "nombre": "CISTICERCOSIS",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B69"
      }
    ],
    "excluye": [],
    "textoOriginal": "CISTICERCOSIS  B69"
  },
  "32": {
    "epiClave": 32,
    "nombre": "RUBÉOLA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B06"
      }
    ],
    "excluye": [],
    "textoOriginal": "RUBÉOLA  ( * + # )  B06"
  },
  "33": {
    "epiClave": 33,
    "nombre": "VARICELA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B01"
      }
    ],
    "excluye": [],
    "textoOriginal": "VARICELA  ( # )  B01           "
  },
  "34": {
    "epiClave": 34,
    "nombre": "ESCARLATINA",
    "grupo": "OTRAS ENFERME- DADES EXANTE- MÁTICAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A38"
      }
    ],
    "excluye": [],
    "textoOriginal": "ESCARLATINA  A38"
  },
  "35": {
    "epiClave": 35,
    "nombre": "ERISIPELA",
    "grupo": "OTRAS ENFERME- DADES EXANTE- MÁTICAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A46"
      }
    ],
    "excluye": [],
    "textoOriginal": "ERISIPELA  A46"
  },
  "36": {
    "epiClave": 36,
    "nombre": "CONJUNTIVITIS EPIDÉMICA AGUDA HEMORRÁGICA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B303"
      }
    ],
    "excluye": [],
    "textoOriginal": "CONJUNTIVITIS EPIDÉMICA AGUDA HEMORRÁGICA (#)  B30.3"
  },
  "37": {
    "epiClave": 37,
    "nombre": "HEPATITIS VÍRICA A",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B15"
      }
    ],
    "excluye": [],
    "textoOriginal": "HEPATITIS VÍRICA A  (+ # )  B15           "
  },
  "38": {
    "epiClave": 38,
    "nombre": "HEPATITIS VÍRICA B",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B16"
      }
    ],
    "excluye": [],
    "textoOriginal": "HEPATITIS VÍRICA B  (+ # )  B16"
  },
  "39": {
    "epiClave": 39,
    "nombre": "OTRAS HEPATITIS VÍRICAS",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B17",
        "hasta": "B19"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "B171"
      },
      {
        "tipo": "exacto",
        "clave": "B182"
      }
    ],
    "textoOriginal": "OTRAS HEPATITIS VÍRICAS  B17-B19 EXCEPTO B17.1, B18.2                                                                                              "
  },
  "40": {
    "epiClave": 40,
    "nombre": "MENINGITIS MENINGOCÓCICA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A390"
      }
    ],
    "excluye": [],
    "textoOriginal": "MENINGITIS MENINGOCÓCICA  ( * + # )  A39.0                  "
  },
  "41": {
    "epiClave": 41,
    "nombre": "SÍNDROME MENÍNGEO",
    "grupo": "ENFERME- DADES BAJO VIGILANCIA SINDROMÁ- TICA",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "G00",
        "hasta": "G03"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "G000"
      },
      {
        "tipo": "exacto",
        "clave": "G001"
      }
    ],
    "textoOriginal": "SÍNDROME MENÍNGEO  ( # )  G00-G03 EXCEPTO G00.0, G00.1"
  },
  "42": {
    "epiClave": 42,
    "nombre": "PAROTIDITIS INFECCIOSA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B26"
      }
    ],
    "excluye": [],
    "textoOriginal": "PAROTIDITIS INFECCIOSA  B26"
  },
  "43": {
    "epiClave": 43,
    "nombre": "ESCABIOSIS",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B86"
      }
    ],
    "excluye": [],
    "textoOriginal": "ESCABIOSIS  B86     "
  },
  "44": {
    "epiClave": 44,
    "nombre": "MENINGITIS TUBERCULOSA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A170"
      }
    ],
    "excluye": [],
    "textoOriginal": "MENINGITIS TUBERCULOSA  ( * +  )  A17.0"
  },
  "45": {
    "epiClave": 45,
    "nombre": "TUBERCULOSIS OTRAS FORMAS",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A171"
      },
      {
        "tipo": "exacto",
        "clave": "A178"
      },
      {
        "tipo": "exacto",
        "clave": "A179"
      },
      {
        "tipo": "rango",
        "desde": "A18",
        "hasta": "A19"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUBERCULOSIS OTRAS FORMAS  ( + )  A17.1, A17.8, A17.9, A18-A19            "
  },
  "46": {
    "epiClave": 46,
    "nombre": "FIEBRE REUMÁTICA AGUDA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "I00",
        "hasta": "I02"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE REUMÁTICA AGUDA  I00-I02"
  },
  "47": {
    "epiClave": 47,
    "nombre": "HIPERTENSIÓN ARTERIAL",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "I10",
        "hasta": "I15"
      }
    ],
    "excluye": [],
    "textoOriginal": "HIPERTENSIÓN ARTERIAL  I10-I15"
  },
  "48": {
    "epiClave": 48,
    "nombre": "BOCIO ENDÉMICO",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E01"
      }
    ],
    "excluye": [],
    "textoOriginal": "BOCIO ENDÉMICO  E01"
  },
  "49": {
    "epiClave": 49,
    "nombre": "DIABETES MELLITUS TIPO 2",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "E11",
        "hasta": "E14"
      }
    ],
    "excluye": [],
    "textoOriginal": "DIABETES MELLITUS TIPO 2  E11-E14"
  },
  "51": {
    "epiClave": 51,
    "nombre": "ENFERMEDAD ISQUÉMICA DEL CORAZÓN",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "I20",
        "hasta": "I25"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD ISQUÉMICA DEL CORAZÓN  I20-I25"
  },
  "52": {
    "epiClave": 52,
    "nombre": "ENFERMEDAD CEREBROVASCULAR",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "I60",
        "hasta": "I67"
      },
      {
        "tipo": "exacto",
        "clave": "I69"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD CEREBROVASCULAR  I60-I67, I69"
  },
  "54": {
    "epiClave": 54,
    "nombre": "ASMA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "J45"
      },
      {
        "tipo": "exacto",
        "clave": "J46"
      }
    ],
    "excluye": [],
    "textoOriginal": "ASMA  J45, J46"
  },
  "57": {
    "epiClave": 57,
    "nombre": "INTOXICACIÓN POR PLAGUICIDAS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T60"
      }
    ],
    "excluye": [],
    "textoOriginal": "INTOXICACIÓN POR PLAGUICIDAS  T60"
  },
  "64": {
    "epiClave": 64,
    "nombre": "ENFERMEDAD FEBRIL EXANTEMÁTICA",
    "grupo": "ENFERMEDA- DES BAJO VIGILANCIA SINDRO- MÁTICA",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U97"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD FEBRIL EXANTEMÁTICA  ( * + # )  U97"
  },
  "66": {
    "epiClave": 66,
    "nombre": "PARÁLISIS FLÁCIDA AGUDA",
    "grupo": "ENFERMEDA- DES BAJO VIGILANCIA SINDRO- MÁTICA",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U98"
      }
    ],
    "excluye": [],
    "textoOriginal": "PARÁLISIS FLÁCIDA AGUDA  ( * + # )  U98"
  },
  "68": {
    "epiClave": 68,
    "nombre": "MENINGOENCEFALITIS AMEBIANA PRIMARIA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": true,
    "estudioEpidemiologico": false,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B602"
      }
    ],
    "excluye": [],
    "textoOriginal": "MENINGOENCEFALITIS AMEBIANA PRIMARIA  ( * # )  B60.2"
  },
  "69": {
    "epiClave": 69,
    "nombre": "ONCOCERCOSIS",
    "grupo": "ENFERMEDADES DE INTERES LOCAL O REGIONAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B73"
      }
    ],
    "excluye": [],
    "textoOriginal": "ONCOCERCOSIS  ( + )  B73"
  },
  "72": {
    "epiClave": 72,
    "nombre": "MAL DEL PINTO",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A67"
      }
    ],
    "excluye": [],
    "textoOriginal": "MAL DEL PINTO  A67"
  },
  "73": {
    "epiClave": 73,
    "nombre": "LEPRA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A30"
      }
    ],
    "excluye": [],
    "textoOriginal": "LEPRA  ( + )  A30          "
  },
  "74": {
    "epiClave": 74,
    "nombre": "TRACOMA",
    "grupo": "ENFERMEDADES DE INTERES LOCAL O REGIONAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A71"
      }
    ],
    "excluye": [],
    "textoOriginal": "TRACOMA  ( + )  A71"
  },
  "75": {
    "epiClave": 75,
    "nombre": "POLIOMIELITIS AGUDA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A80"
      }
    ],
    "excluye": [],
    "textoOriginal": "POLIOMIELITIS AGUDA ( * + # )  A80"
  },
  "76": {
    "epiClave": 76,
    "nombre": "PALUDISMO por Plasmodium falciparum",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B50"
      }
    ],
    "excluye": [],
    "textoOriginal": "PALUDISMO por Plasmodium falciparum  ( * + # )  B50"
  },
  "77": {
    "epiClave": 77,
    "nombre": "FIEBRE AMARILLA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A95"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE AMARILLA  ( * + # )  A95"
  },
  "78": {
    "epiClave": 78,
    "nombre": "PESTE",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A20"
      }
    ],
    "excluye": [],
    "textoOriginal": "PESTE  ( * + # )  A20"
  },
  "80": {
    "epiClave": 80,
    "nombre": "TIFO MURINO",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A752"
      }
    ],
    "excluye": [],
    "textoOriginal": "TIFO MURINO  ( * + )  A75.2"
  },
  "81": {
    "epiClave": 81,
    "nombre": "FIEBRE MANCHADA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A770"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE MANCHADA  ( * + )  A77.0"
  },
  "82": {
    "epiClave": 82,
    "nombre": "DIFTERIA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A36"
      }
    ],
    "excluye": [],
    "textoOriginal": "DIFTERIA  ( * + # )  A36"
  },
  "83": {
    "epiClave": 83,
    "nombre": "TOS FERINA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A37"
      }
    ],
    "excluye": [],
    "textoOriginal": "TOS FERINA  ( * + # )  A37"
  },
  "85": {
    "epiClave": 85,
    "nombre": "TÉTANOS",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A34"
      },
      {
        "tipo": "exacto",
        "clave": "A35"
      }
    ],
    "excluye": [],
    "textoOriginal": "TÉTANOS  ( * + # )  A34, A35"
  },
  "86": {
    "epiClave": 86,
    "nombre": "TÉTANOS NEONATAL",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A33"
      }
    ],
    "excluye": [],
    "textoOriginal": "TÉTANOS NEONATAL  ( * + # )  A33"
  },
  "87": {
    "epiClave": 87,
    "nombre": "SARAMPIÓN",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B05"
      }
    ],
    "excluye": [],
    "textoOriginal": "SARAMPIÓN  ( * + # )  B05"
  },
  "88": {
    "epiClave": 88,
    "nombre": "ENCEFALITIS EQUINA VENEZOLANA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A922"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENCEFALITIS EQUINA VENEZOLANA ( * )  A92.2"
  },
  "89": {
    "epiClave": 89,
    "nombre": "DENGUE GRAVE",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A972"
      }
    ],
    "excluye": [],
    "textoOriginal": "DENGUE GRAVE   ( * + #  )  A97.2"
  },
  "90": {
    "epiClave": 90,
    "nombre": "INFLUENZA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "J09",
        "hasta": "J11"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFLUENZA  ( * + # )  J09-J11"
  },
  "91": {
    "epiClave": 91,
    "nombre": "EVENTOS SUPUESTAMENTE ASOCIADOS A LA VACUNACIÓN (ESAVI)",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Y58"
      },
      {
        "tipo": "exacto",
        "clave": "Y59"
      }
    ],
    "excluye": [],
    "textoOriginal": "EVENTOS SUPUESTAMENTE ASOCIADOS A LA VACUNACIÓN (ESAVI)                ( * + )  Y58, Y59"
  },
  "92": {
    "epiClave": 92,
    "nombre": "SÍFILIS CONGÉNITA",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A50"
      }
    ],
    "excluye": [],
    "textoOriginal": "SÍFILIS CONGÉNITA  ( * + )  A50"
  },
  "93": {
    "epiClave": 93,
    "nombre": "OTRAS INFECCIONES INTESTINALES DEBIDAS A PROTOZOARIOS",
    "grupo": "ENFERMEDADES INFECCIOSAS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A070"
      },
      {
        "tipo": "exacto",
        "clave": "A072"
      },
      {
        "tipo": "exacto",
        "clave": "A079"
      }
    ],
    "excluye": [],
    "textoOriginal": "OTRAS INFECCIONES INTESTINALES DEBIDAS A PROTOZOARIOS  A07.0, A07.2, A07.9"
  },
  "94": {
    "epiClave": 94,
    "nombre": "INTOXICACIÓN POR PICADURA DE ALACRÁN",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T632"
      },
      {
        "tipo": "exacto",
        "clave": "X22"
      }
    ],
    "excluye": [],
    "textoOriginal": "INTOXICACIÓN POR PICADURA DE ALACRÁN  T63.2, X22"
  },
  "96": {
    "epiClave": 96,
    "nombre": "ANENCEFALIA",
    "grupo": "DEFECTOS AL NACIMIENTO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Q00"
      }
    ],
    "excluye": [],
    "textoOriginal": "ANENCEFALIA  ( + )  Q00"
  },
  "97": {
    "epiClave": 97,
    "nombre": "TUMOR MALIGNO DEL CUELLO DEL ÚTERO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C53"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL CUELLO DEL ÚTERO  ( + )  C53"
  },
  "98": {
    "epiClave": 98,
    "nombre": "SÍNDROME COQUELUCHOIDE",
    "grupo": "ENFERMEDA- DES BAJO VIGILANCIA SINDRO- MÁTICA",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U99"
      }
    ],
    "excluye": [],
    "textoOriginal": "SÍNDROME COQUELUCHOIDE  ( * + # )  U99"
  },
  "99": {
    "epiClave": 99,
    "nombre": "INFECCIONES INVASIVAS POR HAEMOPHILUS INFLUENZAE",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A413"
      },
      {
        "tipo": "exacto",
        "clave": "G000"
      },
      {
        "tipo": "exacto",
        "clave": "J14"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIONES INVASIVAS POR HAEMOPHILUS INFLUENZAE  ( * + # )  A41.3, G00.0, J14"
  },
  "100": {
    "epiClave": 100,
    "nombre": "SÍNDROME DE RUBÉOLA CONGÉNITA",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "P350"
      }
    ],
    "excluye": [],
    "textoOriginal": "SÍNDROME DE RUBÉOLA CONGÉNITA  ( * + # )  P35.0"
  },
  "101": {
    "epiClave": 101,
    "nombre": "INFECCIÓN POR VIRUS DEL PAPILOMA HUMANO",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B977"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIÓN POR VIRUS DEL PAPILOMA HUMANO  B97.7"
  },
  "102": {
    "epiClave": 102,
    "nombre": "LEPTOSPIROSIS",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A27"
      }
    ],
    "excluye": [],
    "textoOriginal": "LEPTOSPIROSIS  ( + # )  A27"
  },
  "103": {
    "epiClave": 103,
    "nombre": "TRIQUINOSIS",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B75"
      }
    ],
    "excluye": [],
    "textoOriginal": "TRIQUINOSIS  B75"
  },
  "104": {
    "epiClave": 104,
    "nombre": "HEPATITIS VÍRICA C",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B171"
      },
      {
        "tipo": "exacto",
        "clave": "B182"
      }
    ],
    "excluye": [],
    "textoOriginal": "HEPATITIS VÍRICA C  B17.1, B18.2                "
  },
  "105": {
    "epiClave": 105,
    "nombre": "TOXOPLASMOSIS",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B58"
      }
    ],
    "excluye": [],
    "textoOriginal": "TOXOPLASMOSIS  B58"
  },
  "106": {
    "epiClave": 106,
    "nombre": "INSUFICIENCIA VENOSA PERIFÉRICA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "I872"
      }
    ],
    "excluye": [],
    "textoOriginal": "INSUFICIENCIA VENOSA PERIFÉRICA  I87.2"
  },
  "107": {
    "epiClave": 107,
    "nombre": "EDEMA, PROTEINURIA Y TRANSTORNOS HIPERTENSIVOS EN EL EMBARAZO, PARTO Y PUERPERIO",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "O10",
        "hasta": "O16"
      }
    ],
    "excluye": [],
    "textoOriginal": "EDEMA, PROTEINURIA Y TRANSTORNOS HIPERTENSIVOS EN EL EMBARAZO, PARTO Y PUERPERIO  O10-O16"
  },
  "109": {
    "epiClave": 109,
    "nombre": "ÚLCERAS, GASTRITIS Y DUODENITIS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "K25",
        "hasta": "K29"
      }
    ],
    "excluye": [],
    "textoOriginal": "ÚLCERAS, GASTRITIS Y DUODENITIS  K25-K29"
  },
  "110": {
    "epiClave": 110,
    "nombre": "INFECCIÓN DE VÍAS URINARIAS",
    "grupo": "ENFERME- DADES BAJO VIGILANCIA SINDROMÁ- TICA",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "N30"
      },
      {
        "tipo": "exacto",
        "clave": "N34"
      },
      {
        "tipo": "exacto",
        "clave": "N390"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIÓN DE VÍAS URINARIAS  N30, N34, N39.0  "
  },
  "111": {
    "epiClave": 111,
    "nombre": "ENFERMEDAD ALCOHÓLICA DEL HÍGADO",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "K70"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "K703"
      }
    ],
    "textoOriginal": "ENFERMEDAD ALCOHÓLICA DEL HÍGADO  K70 EXCEPTO K70.3"
  },
  "112": {
    "epiClave": 112,
    "nombre": "INTOXICACIÓN AGUDA POR ALCOHOL",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "F100"
      }
    ],
    "excluye": [],
    "textoOriginal": "INTOXICACIÓN AGUDA POR ALCOHOL  F10.0"
  },
  "114": {
    "epiClave": 114,
    "nombre": "DESNUTRICIÓN LEVE",
    "grupo": "NUTRICIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E441"
      }
    ],
    "excluye": [],
    "textoOriginal": "DESNUTRICIÓN LEVE  E44.1"
  },
  "115": {
    "epiClave": 115,
    "nombre": "DESNUTRICIÓN MODERADA",
    "grupo": "NUTRICIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E440"
      }
    ],
    "excluye": [],
    "textoOriginal": "DESNUTRICIÓN MODERADA  E44.0"
  },
  "116": {
    "epiClave": 116,
    "nombre": "DESNUTRICIÓN SEVERA",
    "grupo": "NUTRICIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "E40",
        "hasta": "E43"
      }
    ],
    "excluye": [],
    "textoOriginal": "DESNUTRICIÓN SEVERA  E40-E43"
  },
  "117": {
    "epiClave": 117,
    "nombre": "DISPLASIA CERVICAL LEVE Y MODERADA",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "N870",
        "hasta": "N871"
      }
    ],
    "excluye": [],
    "textoOriginal": "DISPLASIA CERVICAL LEVE Y MODERADA  ( + )  N87.0-N87.1"
  },
  "118": {
    "epiClave": 118,
    "nombre": "DISPLASIA CERVICAL SEVERA Y CACU IN SITU",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "N872"
      },
      {
        "tipo": "exacto",
        "clave": "D06"
      }
    ],
    "excluye": [],
    "textoOriginal": "DISPLASIA CERVICAL SEVERA Y CACU IN SITU  ( + )  N87.2, D06"
  },
  "119": {
    "epiClave": 119,
    "nombre": "TUMOR MALIGNO DE LA MAMA",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C50"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DE LA MAMA  C50"
  },
  "122": {
    "epiClave": 122,
    "nombre": "VIOLENCIA INTRAFAMILIAR",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "Y070",
        "hasta": "Y072"
      }
    ],
    "excluye": [],
    "textoOriginal": "VIOLENCIA INTRAFAMILIAR  Y07.0-Y07.2"
  },
  "123": {
    "epiClave": 123,
    "nombre": "PEATÓN LESIONADO EN ACCIDENTE DE TRANSPORTE",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "V01",
        "hasta": "V09"
      }
    ],
    "excluye": [],
    "textoOriginal": "PEATÓN LESIONADO EN ACCIDENTE DE TRANSPORTE  V01-V09"
  },
  "124": {
    "epiClave": 124,
    "nombre": "ACCIDENTES DE TRANSPORTE EN VEHÍCULOS CON MOTOR",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "V20",
        "hasta": "V29"
      },
      {
        "tipo": "rango",
        "desde": "V40",
        "hasta": "V79"
      }
    ],
    "excluye": [],
    "textoOriginal": "ACCIDENTES DE TRANSPORTE EN VEHÍCULOS CON MOTOR  V20-V29, V40-V79"
  },
  "125": {
    "epiClave": 125,
    "nombre": "QUEMADURAS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "T20",
        "hasta": "T32"
      }
    ],
    "excluye": [],
    "textoOriginal": "QUEMADURAS  T20-T32"
  },
  "126": {
    "epiClave": 126,
    "nombre": "MORDEDURAS POR PERRO",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "W54"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURAS POR PERRO  W54"
  },
  "127": {
    "epiClave": 127,
    "nombre": "DIABETES MELLITUS TIPO 1",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E10"
      }
    ],
    "excluye": [],
    "textoOriginal": "DIABETES MELLITUS TIPO 1  E10"
  },
  "128": {
    "epiClave": 128,
    "nombre": "GINGIVITIS Y ENFERMEDAD PERIODONTAL",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "K05"
      }
    ],
    "excluye": [],
    "textoOriginal": "GINGIVITIS Y ENFERMEDAD PERIODONTAL  K05"
  },
  "129": {
    "epiClave": 129,
    "nombre": "ENCEFALOCELE",
    "grupo": "DEFECTOS AL NACIMIENTO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Q01"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENCEFALOCELE  ( + )  Q01"
  },
  "130": {
    "epiClave": 130,
    "nombre": "ESPINA BÍFIDA",
    "grupo": "DEFECTOS AL NACIMIENTO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Q05"
      }
    ],
    "excluye": [],
    "textoOriginal": "ESPINA BÍFIDA  ( + )  Q05"
  },
  "131": {
    "epiClave": 131,
    "nombre": "LABIO Y PALADAR HENDIDO",
    "grupo": "DEFECTOS AL NACIMIENTO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "Q35",
        "hasta": "Q37"
      }
    ],
    "excluye": [],
    "textoOriginal": "LABIO Y PALADAR HENDIDO  Q35-Q37"
  },
  "132": {
    "epiClave": 132,
    "nombre": "MORDEDURAS POR OTROS MAMÍFEROS",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "W55"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURAS POR OTROS MAMÍFEROS  W55"
  },
  "135": {
    "epiClave": 135,
    "nombre": "OBESIDAD",
    "grupo": "NUTRICIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E66"
      }
    ],
    "excluye": [],
    "textoOriginal": "OBESIDAD  E66"
  },
  "136": {
    "epiClave": 136,
    "nombre": "DIABETES MELLITUS EN EL EMBARAZO",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "O244"
      }
    ],
    "excluye": [],
    "textoOriginal": "DIABETES MELLITUS EN EL EMBARAZO  O24.4"
  },
  "137": {
    "epiClave": 137,
    "nombre": "ENTERITIS DEBIDA A ROTAVIRUS",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A080"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENTERITIS DEBIDA A ROTAVIRUS  ( * + # )  A08.0"
  },
  "144": {
    "epiClave": 144,
    "nombre": "LEISHMANIASIS VISCERAL",
    "grupo": "ENFERMEDADES DE INTERES LOCAL O REGIONAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B550"
      }
    ],
    "excluye": [],
    "textoOriginal": "LEISHMANIASIS VISCERAL( + # )  B55.0"
  },
  "145": {
    "epiClave": 145,
    "nombre": "LEISHMANIASIS CUTÁNEA",
    "grupo": "ENFERMEDADES DE INTERES LOCAL O REGIONAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B551"
      }
    ],
    "excluye": [],
    "textoOriginal": "LEISHMANIASIS CUTÁNEA ( + # ) B55.1"
  },
  "146": {
    "epiClave": 146,
    "nombre": "ENFERMEDAD POR VIRUS CHIKUNGUNYA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A920"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD POR VIRUS CHIKUNGUNYA ( + # )  A92.0"
  },
  "148": {
    "epiClave": 148,
    "nombre": "EFECTOS DEL CALOR Y DE LA LUZ",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T67"
      },
      {
        "tipo": "exacto",
        "clave": "X30"
      }
    ],
    "excluye": [],
    "textoOriginal": "EFECTOS DEL CALOR Y DE LA LUZ  T67, X30"
  },
  "150": {
    "epiClave": 150,
    "nombre": "CIRROSIS HEPÁTICA ALCOHÓLICA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "K703"
      }
    ],
    "excluye": [],
    "textoOriginal": "CIRROSIS HEPÁTICA ALCOHÓLICA  K70.3"
  },
  "151": {
    "epiClave": 151,
    "nombre": "HIPERPLASIA DE LA PRÓSTATA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "N40"
      }
    ],
    "excluye": [],
    "textoOriginal": "HIPERPLASIA DE LA PRÓSTATA  N40"
  },
  "152": {
    "epiClave": 152,
    "nombre": "HIPOTERMIA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T68"
      }
    ],
    "excluye": [],
    "textoOriginal": "HIPOTERMIA  T68"
  },
  "153": {
    "epiClave": 153,
    "nombre": "INTOXICACIÓN POR MONÓXIDO DE CARBONO",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T58"
      }
    ],
    "excluye": [],
    "textoOriginal": "INTOXICACIÓN POR MONÓXIDO DE CARBONO  ( + )  T58"
  },
  "155": {
    "epiClave": 155,
    "nombre": "ANOREXIA, BULIMIA Y OTROS TRASTORNOS ALIMENTARIOS",
    "grupo": "NUTRICIÓN",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "F50"
      }
    ],
    "excluye": [],
    "textoOriginal": "ANOREXIA, BULIMIA Y OTROS TRASTORNOS ALIMENTARIOS  F50"
  },
  "169": {
    "epiClave": 169,
    "nombre": "DEPRESIÓN",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "F32"
      }
    ],
    "excluye": [],
    "textoOriginal": "DEPRESIÓN  F32"
  },
  "170": {
    "epiClave": 170,
    "nombre": "ENFERMEDAD DE PARKINSON",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "G20"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD DE PARKINSON  G20"
  },
  "171": {
    "epiClave": 171,
    "nombre": "ENFERMEDAD DE ALZHEIMER",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "G30"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD DE ALZHEIMER  G30"
  },
  "172": {
    "epiClave": 172,
    "nombre": "HERIDA POR ARMA DE FUEGO Y PUNZOCORTANTES",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "W32",
        "hasta": "W34"
      }
    ],
    "excluye": [],
    "textoOriginal": "HERIDA POR ARMA DE FUEGO Y PUNZOCORTANTES  W32-W34"
  },
  "173": {
    "epiClave": 173,
    "nombre": "CONJUNTIVITIS",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "H10"
      }
    ],
    "excluye": [],
    "textoOriginal": "CONJUNTIVITIS  H10"
  },
  "175": {
    "epiClave": 175,
    "nombre": "TIFO EPIDÉMICO",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A750"
      }
    ],
    "excluye": [],
    "textoOriginal": "TIFO EPIDÉMICO  ( * + )  A75.0"
  },
  "176": {
    "epiClave": 176,
    "nombre": "ENFERMEDAD INVASIVA POR NEUMOCOCO",
    "grupo": "ENFERMEDADES PREVENIBLES POR VACUNACIÓN",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A403"
      },
      {
        "tipo": "exacto",
        "clave": "G001"
      },
      {
        "tipo": "exacto",
        "clave": "J13"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD INVASIVA POR NEUMOCOCO  ( * + # )  A40.3, G00.1, J13"
  },
  "177": {
    "epiClave": 177,
    "nombre": "OTRAS SALMONELOSIS",
    "grupo": "ENFS INFECS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A02"
      }
    ],
    "excluye": [],
    "textoOriginal": "OTRAS SALMONELOSIS  A02"
  },
  "178": {
    "epiClave": 178,
    "nombre": "FIEBRE PARATIFOIDEA",
    "grupo": "ENFS INFECS Y PARASITARIAS DEL APARATO DIGESTIVO",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "A011",
        "hasta": "A014"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE PARATIFOIDEA  A01.1-A01.4 "
  },
  "179": {
    "epiClave": 179,
    "nombre": "VULVOVAGINITIS",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "N76"
      }
    ],
    "excluye": [],
    "textoOriginal": "VULVOVAGINITIS  N76"
  },
  "180": {
    "epiClave": 180,
    "nombre": "OTRAS RICKETTSIOSIS",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A79"
      }
    ],
    "excluye": [],
    "textoOriginal": "OTRAS RICKETTSIOSIS  ( + )  A79"
  },
  "181": {
    "epiClave": 181,
    "nombre": "INFECCIÓN ASOCIADA A LA ATENCIÓN DE LA SALUD",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [],
    "excluye": [],
    "textoOriginal": "INFECCIÓN ASOCIADA A LA ATENCIÓN DE LA SALUD  ( + # )  S/C"
  },
  "182": {
    "epiClave": 182,
    "nombre": "ENFERMEDAD POR VIRUS ÉBOLA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A984"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENFERMEDAD POR VIRUS ÉBOLA ( * + # )  A98.4"
  },
  "183": {
    "epiClave": 183,
    "nombre": "INFECCIÓN POR VIRUS ZIKA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A925"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIÓN POR VIRUS ZIKA ( * + # )  A92.5"
  },
  "184": {
    "epiClave": 184,
    "nombre": "MICROCEFALIA",
    "grupo": "DEFECTOS AL NACIMIENTO",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Q02"
      }
    ],
    "excluye": [],
    "textoOriginal": "MICROCEFALIA ( * + ) Q02"
  },
  "186": {
    "epiClave": 186,
    "nombre": "TRIPANOSOMIASIS AMERICANA (ENFERMEDAD DE CHAGAS) AGUDA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B570",
        "hasta": "B571"
      }
    ],
    "excluye": [],
    "textoOriginal": "TRIPANOSOMIASIS AMERICANA (ENFERMEDAD DE CHAGAS) AGUDA       ( + # )  B57.0-B57.1"
  },
  "187": {
    "epiClave": 187,
    "nombre": "TRIPANOSOMIASIS AMERICANA (ENFERMEDAD DE CHAGAS) CRÓNICA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B572",
        "hasta": "B575"
      }
    ],
    "excluye": [],
    "textoOriginal": "TRIPANOSOMIASIS AMERICANA (ENFERMEDAD DE CHAGAS) CRÓNICA       ( + # )  B57.2-B57.5"
  },
  "188": {
    "epiClave": 188,
    "nombre": "FIEBRE POR VIRUS MAYARO",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A928"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE POR VIRUS MAYARO ( * + # )  A92.8"
  },
  "189": {
    "epiClave": 189,
    "nombre": "DENGUE CON SIGNOS DE ALARMA",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A971"
      }
    ],
    "excluye": [],
    "textoOriginal": "DENGUE CON SIGNOS DE ALARMA ( * + #  )  A97.1"
  },
  "191": {
    "epiClave": 191,
    "nombre": "COVID-19",
    "grupo": "ENFERMEDADES INFECCIOSAS DEL APARATO RESPIRATORIO",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "U071",
        "hasta": "U072"
      }
    ],
    "excluye": [],
    "textoOriginal": "COVID-19 ( * + # )  U07.1-U07.2"
  },
  "192": {
    "epiClave": 192,
    "nombre": "INFECCIÓN POR EL VIRUS DE LA INMUNODEFICIENCIA HUMANA",
    "grupo": "ENFERMEDADES DE TRANSMISIÓN SEXUAL",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "B20",
        "hasta": "B24"
      },
      {
        "tipo": "exacto",
        "clave": "Z21"
      }
    ],
    "excluye": [],
    "textoOriginal": "INFECCIÓN POR EL VIRUS DE LA INMUNODEFICIENCIA HUMANA ( * + )  B20-B24, Z21                  "
  },
  "194": {
    "epiClave": 194,
    "nombre": "VIRUELA SÍMICA",
    "grupo": "OTRAS ENFERMEDADES TRANSMISIBLES",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B04"
      }
    ],
    "excluye": [],
    "textoOriginal": "VIRUELA SÍMICA ( * + # )  B04"
  },
  "195": {
    "epiClave": 195,
    "nombre": "ENVENENAMIENTO AUTOINFLIGIDO INTENCIONALMENTE POR ANALGÉSICOS NO NARCÓTICOS, ANTIPIRÉTICOS Y ANTIRREUMÁTICOS",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X60"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENVENENAMIENTO AUTOINFLIGIDO INTENCIONALMENTE POR ANALGÉSICOS NO NARCÓTICOS, ANTIPIRÉTICOS Y ANTIRREUMÁTICOS  X60"
  },
  "196": {
    "epiClave": 196,
    "nombre": "ENVENENAMIENTO AUTOINFLIGIDO INTENCIONALMENTE POR DROGAS ANTIEPILÉPTICAS, SEDANTES, HIPNÓTICAS, ANTIPARKINSONIANAS Y PSICOTRÓPICAS",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X61"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENVENENAMIENTO AUTOINFLIGIDO INTENCIONALMENTE POR DROGAS ANTIEPILÉPTICAS, SEDANTES, HIPNÓTICAS, ANTIPARKINSONIANAS Y PSICOTRÓPICAS  X61"
  },
  "197": {
    "epiClave": 197,
    "nombre": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR AHORCAMIENTO, ESTRANGULAMIENTO O SOFOCACIÓN",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X70"
      }
    ],
    "excluye": [],
    "textoOriginal": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR AHORCAMIENTO, ESTRANGULAMIENTO O SOFOCACIÓN  X70"
  },
  "198": {
    "epiClave": 198,
    "nombre": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR DISPARO DE ARMA CORTA",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X72"
      }
    ],
    "excluye": [],
    "textoOriginal": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR DISPARO DE ARMA CORTA  X72"
  },
  "199": {
    "epiClave": 199,
    "nombre": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR OBJETO CORTANTE",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X78"
      }
    ],
    "excluye": [],
    "textoOriginal": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE POR OBJETO CORTANTE  X78"
  },
  "200": {
    "epiClave": 200,
    "nombre": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE AL SALTAR DESDE UN LUGAR ELEVADO",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "X80"
      }
    ],
    "excluye": [],
    "textoOriginal": "LESIÓN AUTOINFLIGIDA INTENCIONALMENTE AL SALTAR DESDE UN LUGAR ELEVADO  X80"
  },
  "201": {
    "epiClave": 201,
    "nombre": "HISTORIA PERSONAL DE LESIÓN AUTOINFLIGIDA INTENCIONALMENTE (INTENTO DE SUICIDIO)",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "Z915"
      }
    ],
    "excluye": [],
    "textoOriginal": "HISTORIA PERSONAL DE LESIÓN AUTOINFLIGIDA INTENCIONALMENTE (INTENTO DE SUICIDIO)  Z91.5"
  },
  "202": {
    "epiClave": 202,
    "nombre": "OTROS SÍNTOMAS Y SIGNOS QUE INVOLUCRAN EL ESTADO EMOCIONAL (IDEACIÓN SUICIDA)",
    "grupo": "ENFERMEDADES NEUROLÓGICAS Y DE SALUD MENTAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "R458"
      }
    ],
    "excluye": [],
    "textoOriginal": "OTROS SÍNTOMAS Y SIGNOS QUE INVOLUCRAN EL ESTADO EMOCIONAL (IDEACIÓN SUICIDA)  R45.8 "
  },
  "203": {
    "epiClave": 203,
    "nombre": "TUMOR MALIGNO DE LA PRÓSTATA",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C61"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DE LA PRÓSTATA  C61"
  },
  "204": {
    "epiClave": 204,
    "nombre": "TUMOR MALIGNO DE TRÁQUEA, BRONQUIOS Y PULMÓN",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C33",
        "hasta": "C34"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DE TRÁQUEA, BRONQUIOS Y PULMÓN  C33-C34"
  },
  "205": {
    "epiClave": 205,
    "nombre": "TUMOR MALIGNO DEL ESTÓMAGO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C16"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL ESTÓMAGO  C16"
  },
  "206": {
    "epiClave": 206,
    "nombre": "TUMOR MALIGNO DEL COLON Y RECTO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C18",
        "hasta": "C21"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL COLON Y RECTO  C18-C21"
  },
  "207": {
    "epiClave": 207,
    "nombre": "TUMOR MALIGNO DEL HÍGADO Y DE LAS VÍAS BILIARES INTRAHEPÁTICAS",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C22"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL HÍGADO Y DE LAS VÍAS BILIARES INTRAHEPÁTICAS  C22"
  },
  "208": {
    "epiClave": 208,
    "nombre": "LINFOMA HODKING",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C81"
      }
    ],
    "excluye": [],
    "textoOriginal": "LINFOMA HODKING  C81"
  },
  "209": {
    "epiClave": 209,
    "nombre": "LINFOMA NO HODKING",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C82",
        "hasta": "C85"
      }
    ],
    "excluye": [],
    "textoOriginal": "LINFOMA NO HODKING  C82-C85"
  },
  "210": {
    "epiClave": 210,
    "nombre": "LEUCEMIA",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C91",
        "hasta": "C95"
      }
    ],
    "excluye": [],
    "textoOriginal": "LEUCEMIA  C91-C95"
  },
  "211": {
    "epiClave": 211,
    "nombre": "TUMOR MALIGNO DEL ESÓFAGO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C15"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL ESÓFAGO  C15"
  },
  "212": {
    "epiClave": 212,
    "nombre": "TUMOR MALIGNO DEL PÁNCREAS",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C25"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL PÁNCREAS  C25"
  },
  "213": {
    "epiClave": 213,
    "nombre": "TUMOR MALIGNO DEL CUERPO DEL ÚTERO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C54"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL CUERPO DEL ÚTERO  C54"
  },
  "214": {
    "epiClave": 214,
    "nombre": "TUMOR MALIGNO DEL OVARIO",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C56"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DEL OVARIO  C56"
  },
  "215": {
    "epiClave": 215,
    "nombre": "TUMORES MALIGNOS DEL ENCÉFALO Y DE OTRAS PARTES DEL SISTEMA NERVIOSO CENTRAL",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C70",
        "hasta": "C72"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMORES MALIGNOS DEL ENCÉFALO Y DE OTRAS PARTES DEL SISTEMA NERVIOSO CENTRAL  C70-C72"
  },
  "216": {
    "epiClave": 216,
    "nombre": "TUMORES MALIGNOS DE LOS HUESOS Y DE LOS CARTÍLAGOS ARTICULARES",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "C40",
        "hasta": "C41"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMORES MALIGNOS DE LOS HUESOS Y DE LOS CARTÍLAGOS ARTICULARES  C40-C41"
  },
  "217": {
    "epiClave": 217,
    "nombre": "TUMOR MALIGNO DE RIÑÓN",
    "grupo": "DISPLASIAS Y NEOPLASIAS",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "C64"
      }
    ],
    "excluye": [],
    "textoOriginal": "TUMOR MALIGNO DE RIÑÓN  C64"
  },
  "218": {
    "epiClave": 218,
    "nombre": "RABIA HUMANA POR FAUNA SILVESTRE",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A820"
      }
    ],
    "excluye": [],
    "textoOriginal": "RABIA HUMANA POR FAUNA SILVESTRE ( * + # )  A82.0"
  },
  "219": {
    "epiClave": 219,
    "nombre": "RABIA HUMANA POR FAUNA URBANA",
    "grupo": "ZOONOSIS",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A821"
      }
    ],
    "excluye": [],
    "textoOriginal": "RABIA HUMANA POR FAUNA URBANA ( * + # )  A82.1"
  },
  "220": {
    "epiClave": 220,
    "nombre": "MORDEDURA DE ARAÑA VIUDA NEGRA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U602"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURA DE ARAÑA VIUDA NEGRA  (+)  U60.2"
  },
  "221": {
    "epiClave": 221,
    "nombre": "MORDEDURA DE ARAÑA VIOLINISTA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U603"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURA DE ARAÑA VIOLINISTA  (+)  U60.3"
  },
  "222": {
    "epiClave": 222,
    "nombre": "MORDEDURA DE OTRAS ARAÑAS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T633"
      },
      {
        "tipo": "exacto",
        "clave": "X21"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "U602"
      },
      {
        "tipo": "exacto",
        "clave": "U603"
      }
    ],
    "textoOriginal": "MORDEDURA DE OTRAS ARAÑAS  (+)  T63.3, X21 EXCEPTO U60.2 y U60.3"
  },
  "223": {
    "epiClave": 223,
    "nombre": "PICADURA DE ABEJA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U604"
      }
    ],
    "excluye": [],
    "textoOriginal": "PICADURA DE ABEJA  (+)  U60.4"
  },
  "224": {
    "epiClave": 224,
    "nombre": "PICADURA DE AVISPA",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U605"
      }
    ],
    "excluye": [],
    "textoOriginal": "PICADURA DE AVISPA  (+)  U60.5"
  },
  "225": {
    "epiClave": 225,
    "nombre": "PICADURA POR OTROS ARTRÓPODOS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T634"
      },
      {
        "tipo": "exacto",
        "clave": "X23"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "U604"
      },
      {
        "tipo": "exacto",
        "clave": "U605"
      }
    ],
    "textoOriginal": "PICADURA POR OTROS ARTRÓPODOS  (+)  T63.4, X23 EXCEPTO U60.4 y U60.5"
  },
  "226": {
    "epiClave": 226,
    "nombre": "PICADURA O INTOXICACIÓN POR OTROS ANIMALES PONZOÑOSOS",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T631"
      },
      {
        "tipo": "rango",
        "desde": "T635",
        "hasta": "T639"
      },
      {
        "tipo": "exacto",
        "clave": "X26"
      },
      {
        "tipo": "exacto",
        "clave": "X27"
      },
      {
        "tipo": "exacto",
        "clave": "U608"
      }
    ],
    "excluye": [],
    "textoOriginal": "PICADURA O INTOXICACIÓN POR OTROS ANIMALES PONZOÑOSOS  (+)  T63.1, T63.5-T63.9, X26, X27, U60.8"
  },
  "227": {
    "epiClave": 227,
    "nombre": "MORDEDURA POR SERPIENTE DE CASCABEL",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U600"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURA POR SERPIENTE DE CASCABEL  (+)  U60.0"
  },
  "228": {
    "epiClave": 228,
    "nombre": "MORDEDURA POR SERPIENTE CORAL",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "U601"
      }
    ],
    "excluye": [],
    "textoOriginal": "MORDEDURA POR SERPIENTE CORAL  (+)  U60.1"
  },
  "229": {
    "epiClave": 229,
    "nombre": "MORDEDURA POR OTRAS SERPIENTES",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "T630"
      },
      {
        "tipo": "exacto",
        "clave": "X20"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "U600"
      },
      {
        "tipo": "exacto",
        "clave": "U601"
      }
    ],
    "textoOriginal": "MORDEDURA POR OTRAS SERPIENTES  (+)  T63.0, X20 EXCEPTO U60.0 y U60.1"
  },
  "230": {
    "epiClave": 230,
    "nombre": "ENVENENAMIENTO ACCIDENTAL POR, Y EXPOSICIÓN A SUSTANCIAS NOCIVAS",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "X40",
        "hasta": "X49"
      }
    ],
    "excluye": [],
    "textoOriginal": "ENVENENAMIENTO ACCIDENTAL POR, Y EXPOSICIÓN A SUSTANCIAS NOCIVAS  X40-X49 "
  },
  "231": {
    "epiClave": 231,
    "nombre": "CONTACTO TRAUMÁTICO CON OTROS ANIMALES Y PLANTAS VENENOSAS",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "X24",
        "hasta": "X29"
      }
    ],
    "excluye": [
      {
        "tipo": "exacto",
        "clave": "X26"
      },
      {
        "tipo": "exacto",
        "clave": "X27"
      }
    ],
    "textoOriginal": "CONTACTO TRAUMÁTICO CON OTROS ANIMALES Y PLANTAS VENENOSAS  X24-X29 EXCEPTO X26, X27"
  },
  "232": {
    "epiClave": 232,
    "nombre": "EXPOSICIÓN AL HUMO, FUEGO Y LLAMAS",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "X00",
        "hasta": "X09"
      }
    ],
    "excluye": [],
    "textoOriginal": "EXPOSICIÓN AL HUMO, FUEGO Y LLAMAS  X00-X09 "
  },
  "233": {
    "epiClave": 233,
    "nombre": "CONTACTO CON CALOR Y SUSTANCIAS CALIENTES",
    "grupo": "ACCIDENTES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "rango",
        "desde": "X10",
        "hasta": "X19"
      }
    ],
    "excluye": [],
    "textoOriginal": "CONTACTO CON CALOR Y SUSTANCIAS CALIENTES  X10-X19 "
  },
  "234": {
    "epiClave": 234,
    "nombre": "DEPLECIÓN DEL VOLUMEN (DESHIDRATACIÓN)",
    "grupo": "ENFERMEDADES NO TRANSMISIBLES",
    "notificacionInmediata": false,
    "estudioEpidemiologico": false,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "E86"
      }
    ],
    "excluye": [],
    "textoOriginal": "DEPLECIÓN DEL VOLUMEN (DESHIDRATACIÓN)  E86"
  },
  "235": {
    "epiClave": 235,
    "nombre": "MIASIS",
    "grupo": "ENFERMEDADES DE INTERES LOCAL O REGIONAL",
    "notificacionInmediata": false,
    "estudioEpidemiologico": true,
    "estudioBrote": false,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "B87"
      }
    ],
    "excluye": [],
    "textoOriginal": "MIASIS ( + )  B87"
  },
  "504": {
    "epiClave": 504,
    "nombre": "FIEBRE DEL OESTE DEL NILO",
    "grupo": "ENFERMEDADES TRANSMITIDAS POR VECTOR",
    "notificacionInmediata": true,
    "estudioEpidemiologico": true,
    "estudioBrote": true,
    "incluye": [
      {
        "tipo": "exacto",
        "clave": "A923"
      }
    ],
    "excluye": [],
    "textoOriginal": "FIEBRE DEL OESTE DEL NILO  ( * + # )  A92.3"
  }
}
