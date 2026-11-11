/**
 * Horde worker lookups. The Horde asks every client to identify itself with
 * a Client-Agent header.
 */
import { QueryClient } from '@tanstack/react-query'
import { imageWorkersQuery, teamsQuery, workerQuery } from './workers'

jest.mock('app/_utils/appUtils', () => ({
  clientHeader: () => 'ArtBot:test',
  getApiHostServer: () => 'https://aihorde.net'
}))

describe('Horde worker lookups', () => {
  const originalFetch = global.fetch
  let client: QueryClient

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    global.fetch = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => (url.endsWith('/w1') ? { id: 'w1', type: 'image' } : [])
    })) as unknown as typeof fetch
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it.each([
    ['the worker list', imageWorkersQuery],
    ['one worker', workerQuery('w1')],
    ['teams', teamsQuery]
  ])('sends Client-Agent when loading %s', async (_name, query) => {
    await client.query(query as any)

    const [, init] = (fetch as jest.Mock).mock.calls[0]
    expect(init.headers['Client-Agent']).toBe('ArtBot:test')
  })

  it('treats a worker the Horde does not know as not found', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({})
    })) as unknown as typeof fetch

    await expect(client.query(workerQuery('gone'))).resolves.toBeNull()
  })
})
