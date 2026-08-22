export function sanitizeForAI(history: string): string {
  return history
    .replace(/^\s*-\s*Nombre\s*:.*$/gim, '')
    .replace(/^\s*-\s*CURP\s*:.*$/gim, '')
    .replace(/^\s*-\s*Tel\s*:.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function splitByIdentification(history: string): {
  identification: string
  rest: string
} {
  // Encuentra la línea exacta del encabezado de la ficha (tolerando espacios y ó/ o)
  const headerRe = /^\s*\|\s*Ficha\s+de\s+Identificaci[oó]n\s*\|\s*$/im
  const headerMatch = headerRe.exec(history)

  if (!headerMatch) {
    // Si no hay ficha, devolvemos todo en "rest"
    return { identification: '', rest: history.trim() }
  }

  // Índice donde termina la línea del encabezado
  const startIdx = headerMatch.index

  // Buscamos el inicio de la SIGUIENTE sección "| Algo |" DESPUÉS del encabezado
  // Nota: [^\n|]+ = cualquier título hasta el fin de línea, ignorando barras verticales
  const nextSectionRe = /\n\s*\|\s*[^\n|]+\s*\|\s*\n/gi
  nextSectionRe.lastIndex = headerMatch.index + headerMatch[0].length

  const nextMatch = nextSectionRe.exec(history)

  // Delimitamos el bloque de identificación
  const endIdx = nextMatch ? nextMatch.index + 1 /* mantener salto previo */ : history.length

  const identification = history.slice(startIdx, endIdx).trim()

  // "rest" = todo antes + todo después del bloque
  const rest = (history.slice(0, startIdx) + history.slice(endIdx)).trim()

  return { identification, rest }
}

export const MongoDbIdDateRetriever = (id: string): string => {
  const dateObject = new Date(parseInt(id.substring(0, 8), 16) * 1000)
  const Year = dateObject.getFullYear()
  const Month = dateObject.getMonth()
  const Day = dateObject.getDate()

  return `${Day}/${Month}/${Year}`
}

export const CheckIfSameYear = (prevDate: string): boolean => {
  const dateObject = new Date(prevDate)
  const Year = dateObject.getFullYear()
  const currentYear = new Date().getFullYear()

  console.log(Year)
  console.log(currentYear)

  return Year === currentYear
}
