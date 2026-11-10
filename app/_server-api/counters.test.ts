/**
 * The image counter lives in the status API. The server keeps no count, file
 * or timer of its own.
 */
export {}

// Keep a local .env out of the test.
jest.mock('dotenv', () => ({ config: jest.fn() }))

const load = () => require('./counters') as typeof import('./counters')

describe('updateImageCount', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
    jest.useRealTimers()
  })

  it('posts each image to the status API', () => {
    process.env.ARTBOT_STATUS_API = 'https://status.example.test'
    load().updateImageCount()

    expect(fetch).toHaveBeenCalledWith('https://status.example.test/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', service: 'ArtBot_v1' })
    })
  })

  it('falls back to STATUS_API', () => {
    delete process.env.ARTBOT_STATUS_API
    process.env.STATUS_API = 'https://fallback.example.test'
    load().updateImageCount()

    expect(fetch).toHaveBeenCalledWith(
      'https://fallback.example.test/status',
      expect.anything()
    )
  })

  it('does nothing without a status API', () => {
    delete process.env.ARTBOT_STATUS_API
    delete process.env.STATUS_API
    load().updateImageCount()

    expect(fetch).not.toHaveBeenCalled()
  })

  it('starts no timers when loaded', () => {
    jest.useFakeTimers()
    load()

    expect(jest.getTimerCount()).toBe(0)
  })

  it('ignores a failed request', async () => {
    process.env.ARTBOT_STATUS_API = 'https://status.example.test'
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'))

    expect(() => load().updateImageCount()).not.toThrow()
    await Promise.resolve()
  })
})
