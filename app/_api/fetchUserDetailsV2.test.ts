jest.mock('app/_store/userStore', () => ({
  setLoggedInState: jest.fn(),
  setUserInfo: jest.fn()
}))
jest.mock('app/_utils/appUtils', () => ({
  clientHeader: () => 'artbot:test',
  getApiHostServer: () => 'https://aihorde.net',
  isUuid: () => false
}))

describe('user details during a network outage', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    jest.resetModules()
    jest.useFakeTimers()
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('reports temporary unavailability without raising the Next dev error overlay', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    const { setLoggedInState, setUserInfo } = await import(
      'app/_store/userStore'
    )
    const result = fetchUserDetailsV2('test-only-key')
    await jest.runAllTimersAsync()
    await expect(result).resolves.toBeNull()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(console.error).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(setLoggedInState).not.toHaveBeenCalled()
    expect(setUserInfo).not.toHaveBeenCalled()
  })

  it('waits between attempts, with no pointless delay after the final failure', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    const start = Date.now()
    const result = fetchUserDetailsV2('test-only-key')
    await jest.runAllTimersAsync()
    await result
    expect(Date.now() - start).toBe(5000)
  })

  it('can recover on a later successful request', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    const failed = fetchUserDetailsV2('test-only-key')
    await jest.runAllTimersAsync()
    await failed
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: 'Test user', kudos: 123 })
    })
    await expect(fetchUserDetailsV2('test-only-key')).resolves.toMatchObject({
      username: 'Test user',
      kudos: 123
    })
  })
})
