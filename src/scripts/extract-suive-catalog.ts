import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type SuiveCodigo =
  | { tipo: 'exacto'; clave: string }
  | { tipo: 'rango'; desde: string; hasta: string }

interface SuiveDiagnostico {
  epiClave: number
  nombre: string
  grupo: string
  notificacionInmediata: boolean
  estudioEpidemiologico: boolean
  estudioBrote: boolean
  incluye: SuiveCodigo[]
  excluye: SuiveCodigo[]
  textoOriginal: string
}

const root = resolve(__dirname, '../..')
const xlsxPath = resolve(root, 'docs/giis/SUIVE-1.xlsx')
const outputPath = resolve(root, 'src/services/suive/suive.catalog.ts')
const referencePath = resolve(root, 'docs/giis/suive-extraccion-preliminar.json')

const decodeXml = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xA;/gi, '\n')

const xmlFile = (name: string) =>
  execFileSync('unzip', ['-p', xlsxPath, name], { encoding: 'utf8', maxBuffer: 10_000_000 })

const sharedStrings = [...xmlFile('xl/sharedStrings.xml').matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(
  ([, item]) =>
    decodeXml(
      [...item.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(([, text]) => text).join('')
    )
)

const cellValue = (rowXml: string, column: string): string | undefined => {
  const cell = rowXml.match(
    new RegExp(`<c\\b([^>]*\\br="${column}\\d+"[^>]*)>([\\s\\S]*?)<\\/c>`)
  )
  if (!cell) return undefined
  if (cell[1].trimEnd().endsWith('/')) return undefined
  const value = cell[2].match(/<v>([\s\S]*?)<\/v>/)?.[1]
  if (value === undefined) return undefined
  return /\bt="s"/.test(cell[1]) ? sharedStrings[Number(value)] : decodeXml(value)
}

const normalizeSpace = (value: string) => value.replace(/\s+/g, ' ').trim()
const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '')
const codePattern = '[A-Z]\\d{2}(?:\\.\\d)?'

const parseCodeList = (value: string): SuiveCodigo[] =>
  value
    .replace(/\s+[yY]\s+/g, ',')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const range = part.match(new RegExp(`^(${codePattern})\\s*-\\s*(${codePattern})$`))
      if (range) {
        return { tipo: 'rango', desde: normalizeCode(range[1]), hasta: normalizeCode(range[2]) }
      }
      if (new RegExp(`^${codePattern}$`).test(part)) {
        return { tipo: 'exacto', clave: normalizeCode(part) }
      }
      throw new Error(`Código SUIVE sin parsear: "${part}" dentro de "${value}"`)
    })

const parseDiagnosis = (textoOriginal: string) => {
  const normalized = normalizeSpace(textoOriginal)
  const markerMatch = normalized.match(/\(\s*([*+#\s]+)\s*\)/)
  const withoutMarkers = markerMatch ? normalizeSpace(normalized.replace(markerMatch[0], ' ')) : normalized

  if (/\sS\/C$/i.test(withoutMarkers)) {
    return {
      nombre: normalizeSpace(withoutMarkers.replace(/\sS\/C$/i, '')),
      incluye: [] as SuiveCodigo[],
      excluye: [] as SuiveCodigo[],
      markers: markerMatch?.[1] ?? ''
    }
  }

  const firstCode = withoutMarkers.search(new RegExp(`\\b${codePattern}`))
  if (firstCode < 1) throw new Error(`No se encontró código CIE en: "${textoOriginal}"`)

  const nombre = normalizeSpace(withoutMarkers.slice(0, firstCode))
  const codeText = withoutMarkers.slice(firstCode).trim()
  const [includeText, excludeText, ...residue] = codeText.split(/\s+EXCEPTO\s+/i)
  if (residue.length) throw new Error(`Más de un EXCEPTO en: "${textoOriginal}"`)

  return {
    nombre,
    incluye: parseCodeList(includeText),
    excluye: excludeText ? parseCodeList(excludeText) : [],
    markers: markerMatch?.[1] ?? ''
  }
}

const sheetXml = xmlFile('xl/worksheets/sheet1.xml')
const catalog: Record<number, SuiveDiagnostico> = {}
let currentGroup = ''

for (const row of sheetXml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
  const rowNumber = Number(row[1])
  if (rowNumber < 4) continue

  const group = cellValue(row[2], 'A')
  if (group) currentGroup = normalizeSpace(group)

  const original = cellValue(row[2], 'C')
  if (!original) continue
  const normalizedOriginal = normalizeSpace(original)
  if (
    normalizedOriginal === 'Diagnóstico y Código CIE 10a Revisión' ||
    normalizedOriginal.startsWith('( * )')
  ) {
    continue
  }

  const epiRaw = cellValue(row[2], 'D')
  const epiClave = Number(epiRaw)
  if (!Number.isInteger(epiClave)) throw new Error(`Fila ${rowNumber} sin clave EPI válida`)
  if (!currentGroup) throw new Error(`Fila ${rowNumber} sin grupo epidemiológico`)
  if (catalog[epiClave]) throw new Error(`Clave EPI duplicada: ${epiClave}`)

  const parsed = parseDiagnosis(original)
  catalog[epiClave] = {
    epiClave,
    nombre: parsed.nombre,
    grupo: currentGroup,
    notificacionInmediata: parsed.markers.includes('*'),
    estudioEpidemiologico: parsed.markers.includes('+'),
    estudioBrote: parsed.markers.includes('#'),
    incluye: parsed.incluye,
    excluye: parsed.excluye,
    textoOriginal: original
  }
}

const entries = Object.values(catalog)
if (entries.length !== 184) throw new Error(`Se esperaban 184 diagnósticos SUIVE; se extrajeron ${entries.length}`)
const populatedGroups = new Set(entries.map((entry) => entry.grupo))
if (populatedGroups.size !== 18) {
  throw new Error(
    `El catálogo contiene ${populatedGroups.size} grupos con diagnósticos: ${[...populatedGroups].join(' | ')}`
  )
}

const reference = JSON.parse(readFileSync(referencePath, 'utf8')) as Array<{ dx?: string; epi?: unknown }>
const referenceKeys = reference
  .filter(({ dx }) => dx && dx !== 'Diagnóstico y Código CIE 10a Revisión' && !dx.trimStart().startsWith('( * )'))
  .map(({ epi }) => Number(epi))
  .filter(Number.isInteger)
if (
  referenceKeys.length !== entries.length ||
  referenceKeys.some((epiClave) => !catalog[epiClave])
) {
  throw new Error('La extracción no coincide con suive-extraccion-preliminar.json')
}

const generated = `// Código generado por src/scripts/extract-suive-catalog.ts. No editar a mano.\n\nexport interface SuiveDiagnostico {\n  /** Clave EPI del catálogo SUIVE. */\n  epiClave: number\n  /** Nombre tal como lo escribe el catálogo, ya sin marcadores ni códigos. */\n  nombre: string\n  /** Grupo epidemiológico, con espacios normalizados. */\n  grupo: string\n  notificacionInmediata: boolean\n  estudioEpidemiologico: boolean\n  estudioBrote: boolean\n  incluye: SuiveCodigo[]\n  excluye: SuiveCodigo[]\n  /** Texto original de la columna C, para auditar. */\n  textoOriginal: string\n}\n\nexport type SuiveCodigo =\n  | { tipo: 'exacto'; clave: string }\n  | { tipo: 'rango'; desde: string; hasta: string }\n\nexport const suiveCatalog: Record<number, SuiveDiagnostico> = ${JSON.stringify(catalog, null, 2)}\n`

writeFileSync(outputPath, generated)
console.log(`Catálogo SUIVE generado: ${entries.length} diagnósticos, 18 grupos con diagnósticos`)
