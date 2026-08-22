// Shared helpers for the multi-value `derechohabiencia` (Afiliacion[]).
// Mirrors the frontend contract: an afiliación carries its GIIS catalog key
// plus a human description. catalogKey === 0 means the value did not come from
// the catalog (e.g. extracted by AI from free text).

export interface Afiliacion {
  catalogKey: number
  descripcion: string
}

/** Joins descriptions for display / legacy string contexts. Tolerates a raw
 *  string coming from old records. */
export function formatAfiliaciones(d: Afiliacion[] | string | undefined | null): string {
  if (!d) return ''
  if (typeof d === 'string') return d
  return d
    .map((a) => a.descripcion)
    .filter(Boolean)
    .join(', ')
}

/** Wraps a free-text value (e.g. AI-extracted) into Afiliacion[] with
 *  catalogKey 0. Splits on commas. Returns [] for empty/placeholder input. */
export function stringToAfiliaciones(value: string | undefined | null): Afiliacion[] {
  if (!value) return []
  const cleaned = value.trim()
  if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null') {
    return []
  }
  return cleaned
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((descripcion) => ({ catalogKey: 0, descripcion }))
}

/** First selected afiliación's GIIS catalog key, or -1 when none/unknown.
 *  GIIS field 23 (derechohabiencia) is single-valued, so the exchange-file
 *  uses the first selected afiliación. */
export function primaryDerechohabienciaKey(d: Afiliacion[] | string | undefined | null): number {
  if (!d || typeof d === 'string') return -1
  const first = d.find((a) => a.catalogKey > 0) ?? d[0]
  return first && first.catalogKey > 0 ? first.catalogKey : -1
}
