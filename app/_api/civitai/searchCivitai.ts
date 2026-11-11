import type { Embedding } from '_types/civitai'

// API reference: https://github.com/civitai/civitai/wiki/REST-API-Reference
const API = 'https://civitai.com/api/v1/models'
const CIVITAI_PAGE_SIZE = 20
const TIMEOUT_MS = 15000

export type CivitaiSearchKind = 'lora' | 'embedding'

export interface CivitaiSearchParams {
  input: string
  nsfw: boolean
  sd15: boolean
  sd21: boolean
  sdxl: boolean
  pony: boolean
  flux: boolean
  noob: boolean
  illu: boolean
}

export interface CivitaiSearchResult {
  items: Embedding[]
  /** Pass to the next search to get the following results. */
  nextCursor?: string
}

const MODEL_TYPES: Record<CivitaiSearchKind, string[]> = {
  lora: ['LORA', 'LoCon'],
  embedding: ['TextualInversion']
}

// CivitAI's base model names for each filter.
const BASE_MODELS: [keyof CivitaiSearchParams, string[]][] = [
  ['sd15', ['SD 1.4', 'SD 1.5', 'SD 1.5 LCM']],
  ['sd21', ['SD 2.0', 'SD 2.0 768', 'SD 2.1', 'SD 2.1 768', 'SD 2.1 Unclip']],
  ['sdxl', ['SDXL 0.9', 'SDXL 1.0', 'SDXL 1.0 LCM', 'SDXL Turbo']],
  ['pony', ['Pony']],
  ['flux', ['Flux.1 S', 'Flux.1 D']],
  ['noob', ['NoobAI']],
  ['illu', ['Illustrious']]
]

export const buildCivitaiSearchUrl = (
  kind: CivitaiSearchKind,
  params: CivitaiSearchParams,
  cursor?: string
) => {
  const query = new URLSearchParams()
  for (const type of MODEL_TYPES[kind]) query.append('types', type)
  query.set('sort', 'Highest Rated')
  query.set('limit', String(CIVITAI_PAGE_SIZE))

  const input = params.input.trim()
  if (input) query.set('query', input)
  // CivitAI pages with a cursor. It no longer reports page counts.
  if (cursor) query.set('cursor', cursor)

  query.set('nsfw', String(params.nsfw))
  for (const [filter, names] of BASE_MODELS) {
    if (params[filter]) {
      for (const name of names) query.append('baseModels', name)
    }
  }

  return `${API}?${query.toString()}`
}

/**
 * Searches CivitAI. Throws on network errors, timeouts and error responses,
 * so React Query reports them. A newer search cancels the older one through
 * `signal`.
 */
export const searchCivitai = async (
  kind: CivitaiSearchKind,
  params: CivitaiSearchParams,
  { cursor, signal }: { cursor?: string; signal?: AbortSignal } = {}
): Promise<CivitaiSearchResult> => {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort)
  const timeout = setTimeout(abort, TIMEOUT_MS)

  try {
    const response = await fetch(buildCivitaiSearchUrl(kind, params, cursor), {
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`CivitAI search failed: ${response.status}`)
    }
    const { items = [], metadata = {} } = await response.json()
    // Cursors are strings, such as "20" for text searches.
    const next = metadata.nextCursor
    return { items, nextCursor: next == null ? undefined : String(next) }
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
