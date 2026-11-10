/**
 * @jest-environment jsdom
 *
 * Only one open tab (the primary window) sends and polls jobs. Tabs agree on it
 * through the PrimaryWindow key in localStorage.
 */
const KEY = 'PrimaryWindow'

const load = () =>
  require('./primaryWindow') as typeof import('./primaryWindow')

const stored = () => JSON.parse(localStorage.getItem(KEY) as string)

describe('primary window', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('claims the key when no other tab has', () => {
    const primaryWindow = load()
    primaryWindow.initializePrimaryWindowOnLoad()

    expect(primaryWindow.pageIsPrimaryWindow()).toBe(true)
    expect(stored().uuid).toEqual(expect.any(String))
  })

  it('takes over from a tab that stopped updating the key', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ uuid: 'closed-tab', timestamp: Date.now() })
    )
    const primaryWindow = load()
    primaryWindow.initializePrimaryWindowOnLoad()
    expect(primaryWindow.pageIsPrimaryWindow()).toBe(false)

    jest.advanceTimersByTime(6000)

    expect(primaryWindow.pageIsPrimaryWindow()).toBe(true)
    expect(stored().uuid).not.toBe('closed-tab')
  })

  it.each([
    ['is removed', () => localStorage.removeItem(KEY)],
    ['is not valid JSON', () => localStorage.setItem(KEY, '{not json')],
    ['holds null', () => localStorage.setItem(KEY, 'null')],
    ['holds an array', () => localStorage.setItem(KEY, '[]')]
  ])('recovers when the key %s', (_name, breakKey) => {
    const primaryWindow = load()
    primaryWindow.initializePrimaryWindowOnLoad()
    const uuid = stored().uuid

    breakKey()
    expect(() => jest.advanceTimersByTime(3000)).not.toThrow()

    expect(stored()).toEqual({ uuid, timestamp: expect.any(Number) })
    expect(primaryWindow.pageIsPrimaryWindow()).toBe(true)
  })
})
