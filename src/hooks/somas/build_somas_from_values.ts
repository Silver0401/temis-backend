import type { HookContext } from '../../declarations'
import { BadRequest } from '@feathersjs/errors'
import { SomaBaseParameters } from '../../json/Constants'

/**
 * Mapa campo-del-formulario -> clave del catálogo. El frontend manda un objeto
 * plano con estas claves; el catálogo es el que define fullName, abreviación y
 * unidad, para no duplicar ese diccionario del lado del cliente.
 */
const CAMPOS: Record<string, keyof typeof SomaBaseParameters> = {
  peso: 'Peso',
  talla: 'Talla',
  imc: 'IMC',
  circAbdominal: 'CintCintura',
  sistolica: 'TAS',
  diastolica: 'TAD',
  frecuenciaCardiaca: 'FC',
  frecuenciaRespiratoria: 'FR',
  temperatura: 'Temp',
  saturacionOxigeno: 'SpO2',
  glucemia: 'Glucemia'
}

/**
 * Centinela GIIS para "parámetro no medido". Sólo aplica a peso y talla: son
 * los únicos campos que el validador NOM-024 exige presentes, y 999 es el valor
 * con el que la norma expresa su ausencia.
 */
const NO_MEDIDO = 999

/** Glucemia: texto del formulario -> código GIIS (NOM-024). */
const TIPO_MEDICION: Record<string, number> = { Ayuno: 1, Casual: 2 }
const OBTENIDO_DE: Record<string, number> = { Laboratorio: 1, 'Tira Reactiva': 2 }

/**
 * Normaliza lo que escribió el médico antes de intentar leerlo como número.
 * La coma decimal se acepta a propósito: en México "78,4" es una captura normal
 * y `parseFloat` la leería como 78 sin quejarse, guardando un peso equivocado
 * sin un solo error a la vista.
 */
const normalizar = (v: unknown): string =>
  String(v ?? '')
    .trim()
    .replace(',', '.')

/**
 * true sólo para un número limpio. `parseFloat` es demasiado permisivo aquí:
 * "70abc" da 70 y "12.5.3" da 12.5, así que validar por `isNaN` deja pasar
 * capturas rotas convertidas en un valor plausible. Se valida el texto, no el
 * resultado de parsearlo.
 */
const esNumero = (txt: string): boolean => /^\d+(\.\d+)?$/.test(txt)

/**
 * Valida lo que capturó el médico y lo normaliza a números.
 *
 * El formulario tiene un campo por parámetro, así que llegan trece cadenas de
 * texto tal como se escribieron. Aquí se comprueban rango y coherencia, y se
 * guarda un objeto de números; `null` significa NO MEDIDO.
 *
 * Antes esta función también armaba un `values[]` con el nombre, la abreviatura
 * y la unidad de cada parámetro —el catálogo duplicado en cada documento— y un
 * `baseText` con todo concatenado en una frase. Las dos representaciones se
 * eliminaron: el catálogo vive una sola vez y el documento guarda números.
 */
export const build_somas_from_values = async (context: HookContext) => {
  const valores = (context.data as any)?.values
  if (!valores || typeof valores !== 'object') return context

  // Los errores se acumulan en vez de lanzarse al primero: el formulario tiene
  // trece campos y devolverlos de uno en uno obliga al médico a reenviarlo una
  // vez por cada dato mal capturado. El shape `{ field, message, section }` es
  // el mismo que usa `giissomatometryValidator`, para que el frontend pinte los
  // dos orígenes de error con el mismo componente.
  const errores: { field: string; message: string; section: string }[] = []
  const medidos: Record<string, number | null> = {}

  for (const [campo, claveCatalogo] of Object.entries(CAMPOS)) {
    const crudo = normalizar(valores[campo])

    // Texto que no es un número limpio ("setenta", "70abc", "--"): se reporta en
    // vez de colapsarlo a 0, que en este dominio significa "no medido" y haría
    // desaparecer el dato sin que nadie se entere.
    if (crudo !== '' && !esNumero(crudo)) {
      errores.push({
        field: campo,
        message: `${SomaBaseParameters[claveCatalogo].fullName}: "${String(valores[campo]).trim()}" no es un número válido`,
        section: 'Somatometría'
      })
      continue
    }

    const valor = crudo === '' ? 0 : parseFloat(crudo)

    // Cero es "no medido", igual que el campo vacío.
    if (valor <= 0) {
      medidos[campo] = null
      continue
    }

    // El rango sale del catálogo, no de números escritos aquí. `giis-somatometry-
    // validator.ts` tiene su propia tabla, y en dos parámetros el catálogo es más
    // estricto que la norma, así que este hook rechaza primero y el mensaje GIIS
    // nunca se alcanza:
    //
    //   CintCintura  catálogo 20–200 cm   ·  GIIS 20–300 cm
    //   FR           catálogo 10–60 rpm   ·  GIIS 10–99 rpm
    //
    // Se deja el catálogo como el más restrictivo a propósito (un valor fuera de
    // ese rango casi siempre es un error de dedo), pero queda anotado porque el
    // tope de 60 rpm puede rechazar una taquipnea neonatal real. Si eso pasa se
    // amplía el catálogo; NO se duplica la tabla aquí.
    const entrada = SomaBaseParameters[claveCatalogo]
    const { min, max } = entrada.validRange
    if (valor < min || valor > max) {
      errores.push({
        field: campo,
        message: `${entrada.fullName} fuera de rango: ${valor} ${entrada.unit} (válido: ${min}–${max})`,
        section: 'Somatometría'
      })
      continue
    }

    medidos[campo] = valor
  }

  const sistolica = medidos.sistolica ?? 0
  const diastolica = medidos.diastolica ?? 0

  // Coherencia entre pares. No es una validación de rango sino de relación, por
  // eso vive fuera del bucle: ningún campo por sí solo la puede detectar.
  if (sistolica > 0 !== diastolica > 0) {
    errores.push({
      field: 'presionArterial',
      message: 'Registra ambas presiones arteriales (sistólica y diastólica) o ninguna',
      section: 'Signos Vitales'
    })
  } else if (sistolica > 0 && sistolica < diastolica) {
    errores.push({
      field: 'presionArterial',
      message: `Presión sistólica (${sistolica}) no puede ser menor que la diastólica (${diastolica})`,
      section: 'Signos Vitales'
    })
  }

  // NO se exige peso y talla juntos. La GIIS los trata de forma independiente
  // (`peso !== 999` y `talla !== 999` por separado) y hay capturas legítimas con
  // uno solo: un paciente encamado al que se pesa pero no se talla, un lactante
  // pesado sin longitud. Lo único que se pierde es el IMC, que ya es opcional.

  if (errores.length > 0) {
    throw new BadRequest('Datos somatométricos inválidos (NOM-024)', { errors: errores })
  }

  const glucemia = medidos.glucemia ?? 0
  const glucemiaTipo = TIPO_MEDICION[String(valores.glucemiaTipo ?? '')] ?? null
  const glucemiaObtenida = OBTENIDO_DE[String(valores.glucemiaObtenida ?? '')] ?? null

  context.data = {
    ...context.data,
    values: {
      peso: medidos.peso ?? null,
      talla: medidos.talla ?? null,
      imc: medidos.imc ?? null,
      circAbdominal: medidos.circAbdominal ?? null,
      sistolica: medidos.sistolica ?? null,
      diastolica: medidos.diastolica ?? null,
      frecuenciaCardiaca: medidos.frecuenciaCardiaca ?? null,
      frecuenciaRespiratoria: medidos.frecuenciaRespiratoria ?? null,
      temperatura: medidos.temperatura ?? null,
      saturacionOxigeno: medidos.saturacionOxigeno ?? null,
      glucemia: medidos.glucemia ?? null,
      glucemiaTipo,
      glucemiaObtenida
    }
  }

  // `extractedSomatometry` se puebla SIEMPRE, incluso sin ninguna medición.
  // El validador GIIS es campo por campo: todos los parámetros se comprueban con
  // guarda `> 0`, así que un cero simplemente no se valida.
  //
  // Las dos excepciones son peso y talla, los únicos que el validador NO deja
  // en cero (`peso < 1` y `talla < 30` son errores). Para "no medido" la GIIS
  // usa el centinela 999, que el validador reconoce explícitamente. Mandar 999
  // en vez de 0 es lo que permite guardar una somatometría vacía sin apagar la
  // validación del resto de los campos.
  context.params.extractedSomatometry = {
    peso: medidos.peso ?? NO_MEDIDO,
    talla: medidos.talla ?? NO_MEDIDO,
    circunferenciaCintura: medidos.circAbdominal ?? 0,
    sistolica,
    diastolica,
    frecuenciaCardiaca: medidos.frecuenciaCardiaca ?? 0,
    frecuenciaRespiratoria: medidos.frecuenciaRespiratoria ?? 0,
    temperatura: medidos.temperatura ?? 0,
    saturacionOxigeno: medidos.saturacionOxigeno ?? 0,
    glucemia,
    // -1 hace que el validador GIIS exija el dato cuando hay glucemia; 0
    // cuando no la hay, para no pedir algo que no aplica.
    tipoMedicion: glucemiaTipo ?? (glucemia > 0 ? -1 : 0),
    resultadoObtenidoaTravesde: glucemiaObtenida ?? (glucemia > 0 ? -1 : 0)
  }

  return context
}
