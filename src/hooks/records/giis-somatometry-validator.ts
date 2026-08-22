import { BadRequest } from '@feathersjs/errors'
import type { HookContext } from '../../declarations'

interface GIISValidationError {
  field: string
  message: string
  section: string
}

export const giissomatometryValidator = async (context: HookContext) => {
  const errors: GIISValidationError[] = []
  const soma = context.params.extractedSomatometry

  console.log(soma)

  if (!soma) return context

  const sectionSoma = 'Somatometría'

  const pesoFormat = /^\d{1,4}(\.\d{1,3})?$/
  const cinturaFormat = /^\d{1,3}(\.\d{1,2})?$/
  const frecFormat = /^\d{1,3}$/

  if (soma.peso !== 999 && (soma.peso < 1 || soma.peso > 400)) {
    errors.push({ field: 'peso', message: 'El peso debe estar entre 1 y 400 kg', section: sectionSoma })
  }
  if (soma.peso !== 999 && !pesoFormat.test(String(soma.peso))) {
    errors.push({
      field: 'peso',
      message: 'El peso debe tener máximo 4 enteros y 3 decimales (####.###)',
      section: sectionSoma
    })
  }

  if (soma.talla !== 999 && (soma.talla < 30 || soma.talla > 220)) {
    errors.push({ field: 'talla', message: 'La talla debe estar entre 30 y 220 cm', section: sectionSoma })
  }

  if (
    soma.circunferenciaCintura > 0 &&
    (soma.circunferenciaCintura < 20 || soma.circunferenciaCintura > 300)
  ) {
    errors.push({
      field: 'circunferenciaCintura',
      message: 'La circunferencia de cintura debe estar entre 20 y 300 cm',
      section: sectionSoma
    })
  }
  if (soma.circunferenciaCintura > 0 && !cinturaFormat.test(String(soma.circunferenciaCintura))) {
    errors.push({
      field: 'circunferenciaCintura',
      message: 'La circunferencia de cintura debe tener máximo 3 enteros y 2 decimales',
      section: sectionSoma
    })
  }

  const sectionVitales = 'Signos Vitales'

  const hasSistolica = soma.sistolica > 0
  const hasDiastolica = soma.diastolica > 0

  if (hasSistolica !== hasDiastolica) {
    errors.push({
      field: 'presionArterial',
      message: 'Registra ambas presiones arteriales (sistólica y diastólica) o ninguna',
      section: sectionVitales
    })
  } else if (hasSistolica && soma.sistolica < soma.diastolica) {
    errors.push({
      field: 'presionArterial',
      message: 'La presión sistólica debe ser mayor o igual a la diastólica',
      section: sectionVitales
    })
  }

  if (hasSistolica && (soma.sistolica < 50 || soma.sistolica > 300)) {
    errors.push({
      field: 'sistolica',
      message: 'La presión sistólica debe estar entre 50 y 300 mmHg',
      section: sectionVitales
    })
  }

  if (hasDiastolica && (soma.diastolica < 20 || soma.diastolica > 200)) {
    errors.push({
      field: 'diastolica',
      message: 'La presión diastólica debe estar entre 20 y 200 mmHg',
      section: sectionVitales
    })
  }

  if (soma.frecuenciaCardiaca > 0 && (soma.frecuenciaCardiaca < 40 || soma.frecuenciaCardiaca > 220)) {
    errors.push({
      field: 'frecuenciaCardiaca',
      message: 'La frecuencia cardíaca debe estar entre 40 y 220 lpm',
      section: sectionVitales
    })
  }
  if (soma.frecuenciaCardiaca > 0 && !frecFormat.test(String(soma.frecuenciaCardiaca))) {
    errors.push({
      field: 'frecuenciaCardiaca',
      message: 'La frecuencia cardíaca debe tener máximo 3 dígitos',
      section: sectionVitales
    })
  }

  if (
    soma.frecuenciaRespiratoria > 0 &&
    (soma.frecuenciaRespiratoria < 10 || soma.frecuenciaRespiratoria > 99)
  ) {
    errors.push({
      field: 'frecuenciaRespiratoria',
      message: 'La frecuencia respiratoria debe estar entre 10 y 99 rpm',
      section: sectionVitales
    })
  }
  if (soma.frecuenciaRespiratoria > 0 && !frecFormat.test(String(soma.frecuenciaRespiratoria))) {
    errors.push({
      field: 'frecuenciaRespiratoria',
      message: 'La frecuencia respiratoria debe tener máximo 3 dígitos',
      section: sectionVitales
    })
  }

  if (soma.temperatura > 0 && (soma.temperatura < 30.0 || soma.temperatura > 44.0)) {
    errors.push({
      field: 'temperatura',
      message: 'La temperatura debe estar entre 30.0 y 44.0 °C',
      section: sectionVitales
    })
  }

  if (soma.saturacionOxigeno > 0 && (soma.saturacionOxigeno < 1 || soma.saturacionOxigeno > 100)) {
    errors.push({
      field: 'saturacionOxigeno',
      message: 'La saturación de oxígeno debe estar entre 1 y 100 %',
      section: sectionVitales
    })
  }

  const sectionGlucemia = 'Glucemia'

  if (soma.glucemia > 0) {
    if (soma.glucemia < 20 || soma.glucemia > 999) {
      errors.push({
        field: 'glucemia',
        message: 'La glucemia debe estar entre 20 y 999 mg/dl',
        section: sectionGlucemia
      })
    }
    if (soma.tipoMedicion === -1) {
      errors.push({
        field: 'tipoMedicion',
        message: 'Indica si la glucemia fue tomada en ayunas o no',
        section: sectionGlucemia
      })
    }
    if (soma.resultadoObtenidoaTravesde === -1) {
      errors.push({
        field: 'resultadoObtenidoaTravesde',
        message: 'Indica si la glucemia fue obtenida por laboratorio o tira capilar',
        section: sectionGlucemia
      })
    }
  }

  if (errors.length > 0) {
    throw new BadRequest('Datos somatométricos inválidos (NOM-024)', { errors })
  }

  return context
}
