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
  bridge_agent: 'not stored',
  ...overrides
})

describe('fetchMyWorkers', () => {
  const originalFetch = global.fetch
  let responses: Record<string, any>

  beforeEach(() => {
    queryClient.clear()
    responses = { w1: worker('w1'), w2: worker('w2') }
    global.fetch = jest.fn(
      async (url: string, init: Parameters<typeof fetch>[1] = {}) => {
        const id = url.split('/').pop()!
        const body = responses[id]
        if (body === 'fail') throw new TypeError('Failed to fetch')
        if (body === 'gone')
          return { ok: false, status: 404, json: async () => ({}) }
        if (body instanceof Promise) {
          // A slow lookup. It rejects if React Query cancels it.
          return new Promise((resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError'))
            )
            body.then((value) =>
              resolve({ ok: true, status: 200, json: async () => value })
            )
          })
        }
        return { ok: true, status: 200, json: async () => body }
      }
    ) as unknown as typeof fetch
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
    expect(workers.w1).not.toHaveProperty('bridge_agent')
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

  it('keeps the last known details when the Horde cannot be reached', async () => {
    await fetchMyWorkers()
    responses.w1 = 'fail'
    responses.w2 = 'fail'

    await fetchMyWorkers({ fresh: true })

    // An outage used to empty the worker list.
    expect(Object.keys(userInfoStore.state.workers)).toEqual(['w1', 'w2'])
    expect(userInfoStore.state.workers.w1.name).toBe('GPU w1')
  })

  it('drops a worker the Horde no longer has', async () => {
    await fetchMyWorkers()
    responses.w2 = 'gone'

    await fetchMyWorkers({ fresh: true })

    expect(Object.keys(userInfoStore.state.workers)).toEqual(['w1'])
  })

  it('stores the fields the worker settings panel shows', async () => {
    responses.w1 = worker('w1', {
      info: 'My GPU',
      painting: true,
      nsfw: true,
      lora: true,
      'post-processing': true
    })

    await fetchMyWorkers()

    expect(userInfoStore.state.workers.w1).toMatchObject({
      info: 'My GPU',
      painting: true,
      nsfw: true,
      lora: true,
      'post-processing': true
    })
  })

  it('a fresh read is not answered by a lookup that started before the change', async () => {
    let finishOldLookup!: (value: unknown) => void
    responses.w1 = new Promise((resolve) => {
      finishOldLookup = resolve
    })
    userInfoStore.set({ worker_ids: ['w1'], workers: {} })
    // A background refresh starts, then the user pauses the worker.
    const background = fetchMyWorkers()
    responses.w1 = worker('w1', { maintenance_mode: true })

    await fetchMyWorkers({ fresh: true })
    finishOldLookup(worker('w1', { maintenance_mode: false }))
    await background

    expect(userInfoStore.state.workers.w1.maintenance_mode).toBe(true)
  })

  it('does nothing for a user with no workers', async () => {
    userInfoStore.set({ worker_ids: [] })

    await fetchMyWorkers()

    expect(fetch).not.toHaveBeenCalled()
  })
})
