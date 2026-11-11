/**
 * Loading the user's workers into userStore through the shared worker
 * queries.
 */
import { queryClient } from './queryClient'
import fetchMyWorkers from './fetchMyWorkers'
import { userInfoStore } from 'app/_store/userStore'

jest.mock('app/_utils/appUtils', () => ({
  clientHeader: () => 'artbot:test',
  getApiHostServer: () => 'https://aihorde.net'
}))

const worker = (id: string, overrides = {}) => ({
  id,
  name: `GPU ${id}`,
  kudos_rewards: 10,
  maintenance_mode: false,
  max_pixels: 1048576,
  models: ['Deliberate'],
  online: true,
  performance: '1.0 megapixelsteps per second',
  requests_fulfilled: 5,
  team: { id: null, name: null },
  threads: 1,
  trusted: false,
  uptime: 60,
  // Fields the store doesn't keep.
  info: 'not stored',
  ...overrides
})

describe('fetchMyWorkers', () => {
  const originalFetch = global.fetch
  let responses: Record<string, any>

  beforeEach(() => {
    queryClient.clear()
    responses = { w1: worker('w1'), w2: worker('w2') }
    global.fetch = jest.fn(async (url: string) => {
      const id = url.split('/').pop()!
      const body = responses[id]
      if (body === 'fail') throw new TypeError('Failed to fetch')
      return { ok: true, status: 200, json: async () => body }
    }) as unknown as typeof fetch
    userInfoStore.set({ worker_ids: ['w1', 'w2'], workers: {} })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('stores each worker with the fields the app reads', async () => {
    await fetchMyWorkers()

    const { workers } = userInfoStore.state
    expect(Object.keys(workers)).toEqual(['w1', 'w2'])
    expect(workers.w1).toMatchObject({ id: 'w1', name: 'GPU w1', online: true })
    expect(workers.w1).not.toHaveProperty('info')
  })

  it('reuses recent lookups unless asked for fresh ones', async () => {
    await fetchMyWorkers()
    await fetchMyWorkers()
    expect(fetch).toHaveBeenCalledTimes(2)

    // After a pause, the store must show the new state.
    responses.w1 = worker('w1', { maintenance_mode: true })
    await fetchMyWorkers({ fresh: true })
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(userInfoStore.state.workers.w1.maintenance_mode).toBe(true)
  })

  it('leaves out a worker that fails to load', async () => {
    responses.w2 = 'fail'

    await fetchMyWorkers()

    expect(Object.keys(userInfoStore.state.workers)).toEqual(['w1'])
  })

  it('does nothing for a user with no workers', async () => {
    userInfoStore.set({ worker_ids: [] })

    await fetchMyWorkers()

    expect(fetch).not.toHaveBeenCalled()
  })
})
