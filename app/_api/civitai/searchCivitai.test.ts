import {
  buildCivitaiSearchUrl,
  CivitaiSearchParams,
  searchCivitai
} from './searchCivitai'

const params = (overrides: Partial<CivitaiSearchParams> = {}) => ({
  input: '',
  nsfw: false,
  sd15: false,
  sd21: false,
  sdxl: false,
  pony: false,
  flux: false,
  noob: false,
  illu: false,
  ...overrides
})

const searchParams = (url: string) => new URL(url).searchParams

describe('buildCivitaiSearchUrl', () => {
  it('asks for LoRAs or embeddings', () => {
    expect(
      searchParams(buildCivitaiSearchUrl('lora', params())).getAll('types')
    ).toEqual(['LORA', 'LoCon'])
    expect(
      searchParams(buildCivitaiSearchUrl('embedding', params())).getAll('types')
    ).toEqual(['TextualInversion'])
  })

  it('encodes the search text, so & and # stay part of it', () => {
    const query = searchParams(
      buildCivitaiSearchUrl('lora', params({ input: ' cats & dogs #1 ' }))
    )

    expect(query.get('query')).toBe('cats & dogs #1')
    expect(query.get('nsfw')).toBe('false')
  })

  it('filters by base model with baseModels for both kinds', () => {
    // CivitAI ignores the singular baseModel, which embeddings used before.
    for (const kind of ['lora', 'embedding'] as const) {
      const query = searchParams(
        buildCivitaiSearchUrl(kind, params({ sdxl: true, pony: true }))
      )
      expect(query.getAll('baseModels')).toEqual([
        'SDXL 0.9',
        'SDXL 1.0',
        'SDXL 1.0 LCM',
        'SDXL Turbo',
        'Pony'
      ])
      expect(query.has('baseModel')).toBe(false)
    }
  })

  it('pages with a cursor and never sends a page number', () => {
    const first = searchParams(buildCivitaiSearchUrl('lora', params()))
    const next = searchParams(
      buildCivitaiSearchUrl('lora', params({ input: 'pixel' }), '20')
    )

    expect(first.has('cursor')).toBe(false)
    expect(next.get('cursor')).toBe('20')
    expect(first.has('page') || next.has('page')).toBe(false)
  })
})

describe('searchCivitai', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns the items and the next cursor', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ id: 1 }],
        metadata: { nextCursor: '20' }
      })
    })

    await expect(searchCivitai('lora', params())).resolves.toEqual({
      items: [{ id: 1 }],
      nextCursor: '20'
    })
  })

  it('has no next cursor on the last page', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], metadata: {} })
    })

    expect((await searchCivitai('lora', params())).nextCursor).toBeUndefined()
  })

  it('throws on an error response, so the modal can show it', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 })

    await expect(searchCivitai('lora', params())).rejects.toThrow('503')
  })

  it('cancels the request when React Query cancels the search', async () => {
    let requestSignal: AbortSignal | undefined
    global.fetch = jest.fn(
      (_url: string, init: Parameters<typeof fetch>[1]) =>
        new Promise((_resolve, reject) => {
          requestSignal = init!.signal!
          init!.signal!.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        })
    ) as unknown as typeof fetch
    const controller = new AbortController()

    const search = searchCivitai('lora', params(), {
      signal: controller.signal
    })
    controller.abort()

    await expect(search).rejects.toThrow('Aborted')
    expect(requestSignal?.aborted).toBe(true)
  })
})
