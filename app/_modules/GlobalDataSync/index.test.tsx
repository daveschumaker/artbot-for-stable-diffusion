/**
 * @jest-environment jsdom
 *
 * App-wide data loads on startup and refreshes every minute, only while the
 * app is active.
 */
import { act, render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppSettings from 'app/_data-models/AppSettings'
import { userInfoStore } from 'app/_store/userStore'
import { modelStore } from 'app/_store/modelStore'
import GlobalDataSync from '.'

let appActive = true
jest.mock('app/_hooks/useIsAppActive', () => ({
  useIsAppActive: () => appActive
}))

const requests = () =>
  (fetch as jest.Mock).mock.calls.map(([url]: [string]) => {
    const { pathname } = new URL(url, 'http://localhost')
    return pathname.replace(/^.*\/api\//, '/api/')
  })
const count = (path: string) => requests().filter((p) => p === path).length

const responses: Record<string, unknown> = {
  '/api/models/available': { success: true, models: [{ name: 'Deliberate' }] },
  '/api/models/details': {
    success: true,
    models: { Deliberate: { name: 'Deliberate', type: 'ckpt' } }
  },
  '/api/v2/status/performance': { queued_requests: 3 },
  '/api/v2/find_user': {
    username: 'tester#1',
    kudos: 5,
    worker_ids: [],
    sharedkey_ids: []
  }
}

const renderSync = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const view = render(
    <QueryClientProvider client={client}>
      <GlobalDataSync />
    </QueryClientProvider>
  )
  return { ...view, client }
}

const advance = async (ms: number) => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms)
  })
}

describe('GlobalDataSync', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.useFakeTimers()
    appActive = true
    localStorage.clear()
    AppSettings.saveAll({ v: '1' } as any)
    userInfoStore.set({ worker_ids: [], loggedIn: false, username: '' })
    global.fetch = jest.fn(async (url: string) => {
      const path = new URL(url, 'http://localhost').pathname.replace(
        /^.*\/api\//,
        '/api/'
      )
      return { ok: true, status: 200, json: async () => responses[path] }
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
  })

  it('loads models and Horde performance on startup', async () => {
    const { unmount } = renderSync()
    await advance(0)

    expect(count('/api/models/available')).toBe(1)
    expect(count('/api/models/details')).toBe(1)
    expect(count('/api/v2/status/performance')).toBe(1)
    // No API key, so no user lookup.
    expect(count('/api/v2/find_user')).toBe(0)
    // The query functions update the stores the app reads.
    expect(modelStore.state.availableModels).toBeDefined()
    unmount()
  })

  it('refreshes every minute while the app is active', async () => {
    const { unmount } = renderSync()
    await advance(0)
    await advance(60 * 1000)

    expect(count('/api/models/available')).toBe(2)
    expect(count('/api/models/details')).toBe(2)
    expect(count('/api/v2/status/performance')).toBe(2)
    unmount()
  })

  it('stops refreshing while the app is inactive', async () => {
    const { rerender, client, unmount } = renderSync()
    await advance(0)

    appActive = false
    rerender(
      <QueryClientProvider client={client}>
        <GlobalDataSync />
      </QueryClientProvider>
    )
    await advance(3 * 60 * 1000)

    expect(count('/api/models/available')).toBe(1)
    expect(count('/api/v2/status/performance')).toBe(1)
    unmount()
  })

  it('uses the API key from a login made after startup', async () => {
    const { unmount } = renderSync()
    await advance(0)
    expect(count('/api/v2/find_user')).toBe(0)

    // Logging in saves the key and updates the user store.
    AppSettings.set('apiKey', 'test-only-api-key')
    act(() => {
      userInfoStore.set({ loggedIn: true })
    })
    await advance(0)

    expect(count('/api/v2/find_user')).toBe(1)
    const [, init] = (fetch as jest.Mock).mock.calls.find(([url]) =>
      String(url).includes('find_user')
    )
    expect(init.headers.apikey).toBe('test-only-api-key')

    // And it keeps refreshing with that key.
    await advance(60 * 1000)
    expect(count('/api/v2/find_user')).toBe(2)
    unmount()
  })
})
