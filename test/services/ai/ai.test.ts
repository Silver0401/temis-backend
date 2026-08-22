// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'
import { InsuranceReportSchema } from '../../../src/services/ai/insurance-report.schema'

describe('ai service', () => {
  it('registered the service', () => {
    const service = app.service('ai')

    assert.ok(service, 'Registered the service')
  })

  it('validates the canonical insurance report shape', () => {
    const report = {
      identificacion: {
        nombreCompleto: 'Paciente de prueba',
        edad: '42',
        sexo: 'Femenino',
        fechaNacimiento: '01/01/1984',
        curp: ''
      },
      padecimientoActual: 'Dolor documentado en consulta.',
      antecedentesRelevantes: '',
      resumenEvolucion: 'Evolución estable.',
      diagnosticos: [{ cie: 'M54.5', nombre: 'Lumbalgia', fechaInicio: '' }],
      tratamientoActual: 'Tratamiento registrado.',
      pronostico: '',
      medicoTratante: { nombre: 'Dra. Prueba', cedula: '123456', especialidad: 'Medicina' }
    }

    assert.deepStrictEqual(InsuranceReportSchema.parse(report), report)
    assert.throws(() => InsuranceReportSchema.parse({ ...report, pronostico: undefined }))
  })
})
