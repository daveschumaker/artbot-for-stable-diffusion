import { ClientRateLimit } from './clientRateLimit'

afterEach(() => jest.restoreAllMocks())
it('retains a fixed expiry and bounds tracked clients without blocking everyone', () => {
  const rate = new ClientRateLimit(2, 1000, 2)
  const now = Date.now()
  const clock = jest.spyOn(Date, 'now').mockReturnValue(now)
  expect(rate.consume('one')).toBe(true)
  clock.mockReturnValue(now + 500)
  expect(rate.consume('one')).toBe(true)
  expect(rate.consume('one')).toBe(false)
  expect(rate.consume('two')).toBe(true)
  expect(rate.consume('three')).toBe(true)
  expect(rate.blocked('three')).toBe(false)
  clock.mockReturnValue(now + 1001)
  expect(rate.consume('one')).toBe(true)
})
