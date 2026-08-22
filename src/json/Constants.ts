type CHSections = 'AHF' | 'APP' | 'APNP' | 'PEEA' | 'AGO' | 'IPAS' | 'EF'

type CHSectionsIndexed = {
  [key in CHSections]: string
}

export const RiskTypes = ['High', 'Medium', 'Low', 'Controlled']

export const clinicalHistoryBaseFormat = `

| Antecedentes Heredofamiliares |
- Madre: Con diagnóstico de Hipertensión Arterial
- Padre: Con diagnóstico de Diabetes Mellitus
- Hermanos: 8 hermanos, aparentemente sanos
- Abuelos Maternos y Paternos: No especificados
- Hijos: No mencionados en la información proporcionada

| Antecedentes Gineco-Obstétricos |
- Gestas 3, Partos 0, Cesáreas 3, Abortos 0
- Sin enfermedades durante los embarazos
- FUM: 10/07/2025
- Ultima Mamografía: Nunca se la ha realizado 
- Último Papanicolau: Hace 3 meses
- No. de Parejas Sexuales: Diferido

| Antecedentes Personales No Patológicos |
- Alimentación, actividad física, exposición u otros: No especificados en la información proporcionada
- Vacuna SARS-CoV-2, otras inmunizaciones, viajes, mascotas: No especificados en la información proporcionada

| Antecedentes Personales Patológicos |
- Enfermedades: Diabetes Mellitus tipo 2 e Hipertensión Arterial desde hace más de 15 años, problema renal no especificado hace 8 meses
- Medicamentos: Losartan, Amlodipino, Forxiga
- Quirúrgicos: Histerectomía a los 35 años, cesáreas
- Fracturas: Negadas
- Alergias: Interrogado y negado
- Consumo de sustancias, hospitalizaciones, transfusiones: No especificados en la información proporcionada

| Padecimiento, Evolución y Estado Actual |
- Inicia su padecimiento actual 4 horas previas a su llegada con un cuadro sindromático caracterizado por dolor opresivo en el pecho de tipo pleurítico, con una intensidad de 8/10 en la escala EVA. 

| Interrogatorio por Aparatos y Sistemas |
- General:  Refiere malestar general, fiebre, astenia, adinamia.
- Neurológico: Niega alteraciones visuales, paresias, parestesias, cefalea o alteraciones motoras / sensitivas.
- Cardiovascular: Refiere dolor precordial 5/10 EVA. Niega palpitaciones, síncope, 
- Respiratorio: Refiere dolor torácico tipo pleurítico. Niega disnea, tos, expectoraciones, hemoptisis.
- Gastrointestinal: Niega náusea, vómitos, estreñimiento, diarrea, dolor abdominal, distensión abdominal, hematoquecia, hematemesis.
- Genitourinario: Niega disuria, polaquiuria, hematuria, coluria. 
- Musculoesquelético: Niega artralgias, mialgias o edema de extremidades.
- Hematológico: Niega gingivorragia, petequias, púrpura, palidez, hematomas.
- Tegumentario: Niega eritema, prurito, cambios en coloración y textura, alopecia.

| Exploración Física |
- Habitus Exterior: Presenta edad aparente igual a la cronológica sin fascies características de alguna patología.
- Neurológico: Alerta, orientada en sus 3 esferas, atento a su entorno. Sin datos de focalización, fuerza en extremidades 10/10.
- Cabeza y Cuello: Presenta mucosas hidratadas, adecuada coloración mucocutánea, amígdalas faríngeas eutróficas libres de placas exudativas. Cuello cilíndrico, sin adenopatías.
- Tórax: Presenta ruidos cardiacos rítmicos de adecuado tono, sin soplos ni ruidos agregados. Campos pulmonares con murmullo vesicular, sin ruidos agregados.
- Abdomen: Blando, depresible, peristalsis normoaudible, sin dolor a la palpación, timpánico a la percusión, sin masas palpables, sin datos de irritación peritoneal.
- Extremidades: Eutroficas bilaterales, sin edema. Pulsos periféricos de adecuada intensidad, con llenado capilar <2 segundos. 

| Diagnósticos |
- Neumonia Adquirida en la Comunidad

| Tratamiento |
- Antibioticoterapia Empírica
- Tratamiento Sintomático
- Vigilancia de Signos de Alarma: Disnea, Dolor Torácico Intenso, Hemoptisis, Fiebre Persistente, Alteración del Estado Mental
- Reevaluación en 48-72 horas o antes si presenta signos de alarma
`

export const evoNoteBaseFormat = `

 | Subjetivo |
 - Paciente Masculino de 45 años acude para cita de seguimiento, refiere dolor leve en sitio quirúrgico, EVA 3/10, con buena tolerancia. Niega náusea, vómito o fiebre. Refiere apetito conservado y ha iniciado deambulación leve con apoyo. 

 | Objetivo |
  Abdomen blando, depresible, con leve dolor a la palpación en fosa iliaca derecha.
  Heridas quirúrgicas limpias, sin signos de infección, con apósitos secos.

 | Análisis |
 Adecuada evolución  posquirúrgica. Dolor controlado, sin complicaciones evidentes. Disminución progresiva de leucocitos. Tolerancia oral adecuada

 | Plan y Tratamiento |
 	1.	Continuar dieta blanda tolerada.
	2.	Mantener analgesia con paracetamol 500 mg VO cada 8 h por 48 h.
	3.	Vigilar signos de infección en sitio quirúrgico.
`

export const ClinicalHistorySections = ['NE', 'AHF', 'APP', 'APNP', 'AGO', 'EF', 'FyS', 'Imgs', 'Labs']

export const ClinicalHistorySectionsExplained: CHSectionsIndexed = {
  APP: 'Antecedentes Personales Patológicos',
  PEEA: 'Padecimiento, Evolución y Estado Actual',
  APNP: 'Antecedentes Pesronales No Patológicos',
  AHF: 'Antecedentes Heredofamiliares',
  AGO: 'Antecedentes Gineco-Obstétricos',
  EF: 'Exploración Física',
  IPAS: 'Interrogatorio por Aparatos y Sistemas'
}

export const DescriptionSections = ['ClinicalHistory', 'Laboratories', 'Images', 'Drugs', 'Antropometrics']

export const LabBaseParameters = {
  Leu: {
    key: 'Leu',
    abbreviation: 'WBC',
    name: 'Leucocitos',
    fullName: 'Recuento Total de Leucocitos',
    englishName: 'White Blood Cell Count',
    category: 'Biometría Hemática',
    unit: 'x10³/µL',
    conventionalUnit: 'cells/mm³',
    specimen: 'Sangre',
    normalRange: {
      min: 4.5,
      max: 11
    },
    criticalRange: {
      low: 2,
      high: 30
    },
    description:
      'Evalúa la cantidad total de glóbulos blancos y ayuda a detectar infecciones, inflamación o alteraciones hematológicas.'
  },

  Er: {
    key: 'Er',
    abbreviation: 'RBC',
    name: 'Eritrocitos',
    fullName: 'Recuento de Eritrocitos',
    englishName: 'Red Blood Cell Count',
    category: 'Biometría Hemática',
    unit: 'x10⁶/µL',
    conventionalUnit: 'millions/mm³',
    specimen: 'Sangre',
    normalRange: {
      min: 4,
      max: 6
    },
    criticalRange: {
      low: 2.5,
      high: 7.5
    },
    description: 'Mide la cantidad de glóbulos rojos circulantes responsables del transporte de oxígeno.'
  },

  Hb: {
    key: 'Hb',
    abbreviation: 'Hb',
    name: 'Hemoglobina',
    fullName: 'Concentración de Hemoglobina',
    englishName: 'Hemoglobin',
    category: 'Biometría Hemática',
    unit: 'g/dL',
    specimen: 'Sangre',
    normalRange: {
      min: 12,
      max: 16
    },
    criticalRange: {
      low: 6,
      high: 20
    },
    description: 'Proteína encargada del transporte de oxígeno en la sangre.'
  },

  Hcto: {
    key: 'Hcto',
    abbreviation: 'Hct',
    name: 'Hematocrito',
    fullName: 'Porcentaje de Hematocrito',
    englishName: 'Hematocrit',
    category: 'Biometría Hemática',
    unit: '%',
    specimen: 'Sangre',
    normalRange: {
      min: 35,
      max: 53
    },
    criticalRange: {
      low: 20,
      high: 65
    },
    description: 'Representa el porcentaje del volumen sanguíneo ocupado por eritrocitos.'
  },

  VCM: {
    key: 'VCM',
    abbreviation: 'MCV',
    name: 'Volumen Corpuscular Medio',
    fullName: 'Volumen Corpuscular Medio',
    englishName: 'Mean Corpuscular Volume',
    category: 'Índices Eritrocitarios',
    unit: 'fL',
    specimen: 'Sangre',
    normalRange: {
      min: 70,
      max: 100
    },
    criticalRange: {
      low: 50,
      high: 130
    },
    description: 'Indica el tamaño promedio de los eritrocitos.'
  },

  HbCM: {
    key: 'HbCM',
    abbreviation: 'MCH',
    name: 'Hemoglobina Corpuscular Media',
    fullName: 'Hemoglobina Corpuscular Media',
    englishName: 'Mean Corpuscular Hemoglobin',
    category: 'Índices Eritrocitarios',
    unit: 'pg',
    specimen: 'Sangre',
    normalRange: {
      min: 27,
      max: 31
    },
    criticalRange: {
      low: 20,
      high: 40
    },
    description: 'Cantidad promedio de hemoglobina contenida en cada eritrocito.'
  },

  'Linf%': {
    key: 'Linf%',
    abbreviation: 'LYM%',
    name: 'Porcentaje de Linfocitos',
    fullName: 'Porcentaje de Linfocitos',
    englishName: 'Lymphocyte Percentage',
    category: 'Fórmula Blanca',
    unit: '%',
    specimen: 'Sangre',
    normalRange: {
      min: 20,
      max: 40
    },
    criticalRange: {
      low: 5,
      high: 70
    },
    description: 'Proporción de linfocitos respecto al total de leucocitos.'
  },

  'Neu%': {
    key: 'Neu%',
    abbreviation: 'NEU%',
    name: 'Porcentaje de Neutrófilos',
    fullName: 'Porcentaje de Neutrófilos',
    englishName: 'Neutrophil Percentage',
    category: 'Fórmula Blanca',
    unit: '%',
    specimen: 'Sangre',
    normalRange: {
      min: 50,
      max: 70
    },
    criticalRange: {
      low: 20,
      high: 90
    },
    description: 'Representa la proporción de neutrófilos circulantes.'
  },

  PCR: {
    key: 'PCR',
    abbreviation: 'CRP',
    name: 'Proteína C Reactiva',
    fullName: 'Proteína C Reactiva',
    englishName: 'C-Reactive Protein',
    category: 'Inflamación',
    unit: 'mg/dL',
    specimen: 'Sangre',
    normalRange: {
      min: 0,
      max: 0.5
    },
    criticalRange: {
      low: 0,
      high: 20
    },
    description: 'Marcador inflamatorio utilizado para detectar procesos infecciosos o inflamatorios.'
  },

  PLT: {
    key: 'PLT',
    abbreviation: 'PLT',
    name: 'Plaquetas',
    fullName: 'Recuento Plaquetario',
    englishName: 'Platelet Count',
    category: 'Biometría Hemática',
    unit: 'x10³/µL',
    specimen: 'Sangre',
    normalRange: {
      min: 150,
      max: 350
    },
    criticalRange: {
      low: 20,
      high: 1000
    },
    description: 'Evalúa la cantidad de plaquetas involucradas en la coagulación.'
  },

  Na: {
    key: 'Na',
    abbreviation: 'Na+',
    name: 'Sodio',
    fullName: 'Sodio Sérico',
    englishName: 'Sodium',
    category: 'Electrolitos',
    unit: 'mEq/L',
    specimen: 'Suero',
    normalRange: {
      min: 135,
      max: 145
    },
    criticalRange: {
      low: 120,
      high: 160
    },
    description: 'Principal catión extracelular involucrado en balance hídrico y función neuromuscular.'
  },

  K: {
    key: 'K',
    abbreviation: 'K+',
    name: 'Potasio',
    fullName: 'Potasio Sérico',
    englishName: 'Potassium',
    category: 'Electrolitos',
    unit: 'mEq/L',
    specimen: 'Suero',
    normalRange: {
      min: 3.5,
      max: 5.5
    },
    criticalRange: {
      low: 2.5,
      high: 6.5
    },
    description: 'Electrolito esencial para la conducción eléctrica cardíaca y muscular.'
  },

  Cl: {
    key: 'Cl',
    abbreviation: 'Cl-',
    name: 'Cloro',
    fullName: 'Cloro Sérico',
    englishName: 'Chloride',
    category: 'Electrolitos',
    unit: 'mEq/L',
    specimen: 'Suero',
    normalRange: {
      min: 95,
      max: 110
    },
    criticalRange: {
      low: 80,
      high: 120
    },
    description: 'Anión extracelular importante para el equilibrio ácido-base.'
  }
}

export const SomaBaseParameters = {
  Peso: {
    key: 'Peso',
    abbreviation: 'kg',
    name: 'Peso',
    fullName: 'Peso Corporal',
    englishName: 'Body Weight',
    category: 'Antropometría',
    unit: 'kg',
    specimen: 'Medición directa',
    validRange: { min: 1, max: 400 },
    description: 'Masa corporal total del paciente.'
  },

  Talla: {
    key: 'Talla',
    abbreviation: 'cm',
    name: 'Talla',
    fullName: 'Talla',
    englishName: 'Height',
    category: 'Antropometría',
    unit: 'cm',
    specimen: 'Medición directa',
    validRange: { min: 30, max: 220 },
    description: 'Estatura del paciente en centímetros.'
  },

  IMC: {
    key: 'IMC',
    abbreviation: 'kg/m²',
    name: 'IMC',
    fullName: 'Índice de Masa Corporal',
    englishName: 'Body Mass Index',
    category: 'Antropometría',
    unit: 'kg/m²',
    specimen: 'Calculado',
    validRange: { min: 10, max: 70 },
    description: 'Índice que relaciona peso y talla para clasificar el estado nutricional.'
  },

  CintCintura: {
    key: 'CintCintura',
    abbreviation: 'cm',
    name: 'Circunferencia de Cintura',
    fullName: 'Circunferencia de Cintura',
    englishName: 'Waist Circumference',
    category: 'Antropometría',
    unit: 'cm',
    specimen: 'Medición directa',
    validRange: { min: 20, max: 200 },
    description: 'Medida de la circunferencia abdominal, indicador de riesgo cardiovascular.'
  },

  CintCadera: {
    key: 'CintCadera',
    abbreviation: 'cm',
    name: 'Circunferencia de Cadera',
    fullName: 'Circunferencia de Cadera',
    englishName: 'Hip Circumference',
    category: 'Antropometría',
    unit: 'cm',
    specimen: 'Medición directa',
    validRange: { min: 30, max: 200 },
    description: 'Medida de la circunferencia a nivel de las caderas.'
  },

  TAS: {
    key: 'TAS',
    abbreviation: 'mmHg',
    name: 'Presión Sistólica',
    fullName: 'Tensión Arterial Sistólica',
    englishName: 'Systolic Blood Pressure',
    category: 'Signos Vitales',
    unit: 'mmHg',
    specimen: 'Medición directa',
    validRange: { min: 50, max: 300 },
    description: 'Presión máxima ejercida por el corazón durante la sístole.'
  },

  TAD: {
    key: 'TAD',
    abbreviation: 'mmHg',
    name: 'Presión Diastólica',
    fullName: 'Tensión Arterial Diastólica',
    englishName: 'Diastolic Blood Pressure',
    category: 'Signos Vitales',
    unit: 'mmHg',
    specimen: 'Medición directa',
    validRange: { min: 20, max: 200 },
    description: 'Presión mínima en las arterias durante la diástole cardíaca.'
  },

  FC: {
    key: 'FC',
    abbreviation: 'bpm',
    name: 'Frecuencia Cardiaca',
    fullName: 'Frecuencia Cardiaca',
    englishName: 'Heart Rate',
    category: 'Signos Vitales',
    unit: 'bpm',
    specimen: 'Medición directa',
    validRange: { min: 40, max: 220 },
    description: 'Número de latidos cardíacos por minuto.'
  },

  FR: {
    key: 'FR',
    abbreviation: 'rpm',
    name: 'Frecuencia Respiratoria',
    fullName: 'Frecuencia Respiratoria',
    englishName: 'Respiratory Rate',
    category: 'Signos Vitales',
    unit: 'rpm',
    specimen: 'Medición directa',
    validRange: { min: 10, max: 60 },
    description: 'Número de respiraciones por minuto.'
  },

  Temp: {
    key: 'Temp',
    abbreviation: '°C',
    name: 'Temperatura',
    fullName: 'Temperatura Corporal',
    englishName: 'Body Temperature',
    category: 'Signos Vitales',
    unit: '°C',
    specimen: 'Medición directa',
    validRange: { min: 30, max: 44 },
    description: 'Temperatura corporal medida en axila, oral o rectal.'
  },

  SpO2: {
    key: 'SpO2',
    abbreviation: '%',
    name: 'Saturación de Oxígeno',
    fullName: 'Saturación de Oxígeno por Pulsioximetría',
    englishName: 'Oxygen Saturation',
    category: 'Signos Vitales',
    unit: '%',
    specimen: 'Pulsioximetría',
    validRange: { min: 1, max: 100 },
    description: 'Porcentaje de hemoglobina saturada de oxígeno medida por pulsioxímetro.'
  },

  Glucemia: {
    key: 'Glucemia',
    abbreviation: 'mg/dL',
    name: 'Glucemia Capilar',
    fullName: 'Glucemia Capilar',
    englishName: 'Capillary Blood Glucose',
    category: 'Signos Vitales',
    unit: 'mg/dL',
    specimen: 'Sangre capilar',
    validRange: { min: 20, max: 999 },
    description: 'Nivel de glucosa en sangre capilar, medido con glucómetro.'
  }
}
