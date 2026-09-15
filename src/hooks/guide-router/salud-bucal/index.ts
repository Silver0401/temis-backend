/** Consulta Externa de Salud Bucal - GIIS-B016-04-08. */
import { esOdontologo } from '../context'
import * as cat from '../catalogs'
import { fragmento, numero, schemaDe, select } from '../shared'
import type { GuideNode } from '../types'

const CAMPOS: Array<{
  nombre: string
  label: string
  tipo: 'siNo' | 'hilo' | 'cantidad'
  max?: number
}> = [
  { nombre: 'placaBacteriana', label: 'Detección de placa bacteriana', tipo: 'siNo' },
  { nombre: 'cepillado', label: 'Instrucción en técnica de cepillado', tipo: 'siNo' },
  { nombre: 'hiloDental', label: 'Instrucción en uso de hilo dental', tipo: 'hilo' },
  { nombre: 'limpiezaDental', label: 'Limpieza dental', tipo: 'siNo' },
  { nombre: 'protesis', label: 'Revisión e higiene de prótesis bucales', tipo: 'siNo' },
  { nombre: 'tejidosBucales', label: 'Examen de tejidos bucales', tipo: 'siNo' },
  { nombre: 'autoExamen', label: 'Autoexamen de cavidad bucal', tipo: 'siNo' },
  { nombre: 'fluor', label: 'Aplicación tópica de flúor', tipo: 'siNo' },
  { nombre: 'raspadoAlisadoPeriodontal', label: 'Raspado y alisado periodontal', tipo: 'siNo' },
  { nombre: 'barnizFluor', label: 'Aplicación de barniz de flúor', tipo: 'siNo' },
  { nombre: 'fosetasFisuras', label: 'Fosetas y fisuras selladas', tipo: 'cantidad', max: 32 },
  { nombre: 'amalgamas', label: 'Obturaciones con amalgama', tipo: 'cantidad', max: 32 },
  { nombre: 'resinas', label: 'Obturaciones con resina', tipo: 'cantidad', max: 32 },
  { nombre: 'ionomeroVidrio', label: 'Obturaciones con ionómero de vidrio', tipo: 'cantidad', max: 32 },
  { nombre: 'alcasite', label: 'Obturaciones con alcasite', tipo: 'cantidad', max: 32 },
  { nombre: 'obturacionTemporal', label: 'Obturaciones temporales', tipo: 'cantidad', max: 32 },
  { nombre: 'dienteTemp', label: 'Extracciones de dientes temporales', tipo: 'cantidad', max: 9 },
  { nombre: 'dientePerm', label: 'Extracciones de dientes permanentes', tipo: 'cantidad', max: 9 },
  { nombre: 'pulpar', label: 'Piezas tratadas con terapia pulpar', tipo: 'cantidad', max: 9 },
  { nombre: 'cirugiaBucal', label: 'Cirugía bucal menor', tipo: 'siNo' },
  { nombre: 'farmacoTerapia', label: 'Prescripción de fármacos', tipo: 'siNo' },
  { nombre: 'otrasAtenciones', label: 'Otras atenciones', tipo: 'cantidad', max: 9 },
  { nombre: 'radiografias', label: 'Radiografías dentales', tipo: 'cantidad', max: 9 },
  { nombre: 'orientacionSaludBucal', label: 'Orientación de salud bucal', tipo: 'siNo' },
  { nombre: 'tratamientoIntegral', label: 'Tratamiento concluido integralmente', tipo: 'siNo' }
]

export const saludBucalNode: GuideNode = {
  code: 'CSB',
  guide: 'CSB',
  label: 'Salud bucal',
  target: 'SaludBucal',
  appliesTo: esOdontologo,

  schema: schemaDe(CAMPOS.map(({ nombre }) => nombre)),

  promptFragment: fragmento('Consulta externa de salud bucal', [
    'Las acciones binarias usan 0 = NO y 1 = SÍ; no infieras procedimientos que la nota no documenta.',
    'hiloDental usa -1 únicamente en menores de 6 años; desde los 6 años usa 0 = NO y 1 = SÍ.',
    'fosetasFisuras y las obturaciones son cantidades de 0 a 32.',
    'dienteTemp, dientePerm, pulpar, otrasAtenciones y radiografias son cantidades de 0 a 9.',
    'Debe existir al menos una acción realizada distinta de 0; hiloDental=-1 no cuenta como acción.'
  ]),

  buildInputs: (ctx, draft) =>
    CAMPOS.map(({ nombre, label, tipo, max }) => {
      if (tipo === 'cantidad') return numero(nombre, label, draft, { min: 0, max })
      if (tipo === 'hilo') {
        const opciones = ctx.edad !== null && ctx.edad < 6 ? [cat.NO_APLICA] : cat.BUCAL_SI_NO
        return select(nombre, label, opciones, draft)
      }
      return select(nombre, label, cat.BUCAL_SI_NO, draft)
    })
}
