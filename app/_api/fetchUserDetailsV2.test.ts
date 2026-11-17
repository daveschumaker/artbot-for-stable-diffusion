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

  it('validates without publishing an account, then publishes the saved login without refetching', async () => {
    const { validateApiKey, publishValidatedUser, fetchUserDetailsV2 } =
      await import('./fetchUserDetailsV2')
    const { setUserInfo } = await import('app/_store/userStore')
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ username: 'validated-account' })
    })
    const user = await validateApiKey('new-account-key')
    expect(setUserInfo).not.toHaveBeenCalled()
    publishValidatedUser('new-account-key', user)
    await fetchUserDetailsV2('new-account-key')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(setUserInfo).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: 'validated-account' })
    )
  })

  it('applies a cached profile after switching accounts', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    const { setUserInfo } = await import('app/_store/userStore')
    ;(fetch as jest.Mock).mockImplementation(async (_url, options) => ({
      ok: true,
      json: async () => ({ username: options.headers.apikey })
    }))
    await fetchUserDetailsV2('account-a')
    await fetchUserDetailsV2('account-b')
    await fetchUserDetailsV2('account-a')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(setUserInfo).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: 'account-a' })
    )
  })

  it('does not apply a late lookup from the account just switched away from', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    const { setUserInfo } = await import('app/_store/userStore')
    let release!: (response: unknown) => void
    ;(fetch as jest.Mock).mockImplementation(async (_url, options) => {
      if (options.headers.apikey === 'account-a')
        return new Promise((resolve) => {
          release = resolve
        })
      return { ok: true, json: async () => ({ username: 'account-b' }) }
    })
    const older = fetchUserDetailsV2('account-a')
    await fetchUserDetailsV2('account-b')
    release({ ok: true, json: async () => ({ username: 'account-a' }) })
    await expect(older).resolves.toBeNull()
    expect(setUserInfo).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: 'account-b' })
    )
  })

  it('deduplicates concurrent lookups of the same account without rejecting either caller', async () => {
    const { fetchUserDetailsV2 } = await import('./fetchUserDetailsV2')
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ username: 'same-account' })
    })
    const users = await Promise.all([
      fetchUserDetailsV2('same-key'),
      fetchUserDetailsV2('same-key')
    ])
    expect(users.map((user) => user?.username)).toEqual([
      'same-account',
      'same-account'
    ])
    expect(fetch).toHaveBeenCalledTimes(1)
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
