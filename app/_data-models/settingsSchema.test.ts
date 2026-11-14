/** @jest-environment jsdom */
import AppSettings, { SETTINGS_EVENT } from './AppSettings'
import { settingsValues, validSetting } from './settingsSchema'
beforeEach(() => localStorage.clear())
it('uses one trusted-worker default and preserves explicit false values', () => {
  expect(settingsValues({}).useTrusted).toBe(true)
  expect(
    settingsValues({
      useTrusted: false,
      slow_workers: false,
      maxConcurrency: 0
    })
  ).toMatchObject({ useTrusted: false, slow_workers: false, maxConcurrency: 5 })
  expect(validSetting('maxConcurrency', -1)).toBe(false)
  expect(validSetting('theme', {})).toBe(false)
})
it('keeps unknown legacy values while publishing successful saves', () => {
  localStorage.setItem(
    'appConfig',
    JSON.stringify({ unknownLegacy: { preserve: true } })
  )
  const changed = jest.fn()
  window.addEventListener(SETTINGS_EVENT, changed)
  try {
    AppSettings.save('useTrusted', false)
    expect(AppSettings.load()).toMatchObject({
      unknownLegacy: { preserve: true },
      useTrusted: false
    })
    expect(changed).toHaveBeenCalledTimes(1)
  } finally {
    window.removeEventListener(SETTINGS_EVENT, changed)
  }
})
it('refuses to overwrite unreadable stored settings', () => {
  localStorage.setItem('appConfig', '{bad json')
  expect(() => AppSettings.save('theme', 'dark')).toThrow()
  expect(localStorage.getItem('appConfig')).toBe('{bad json')
})
it('does not publish a successful save when storage rejects it', () => {
  localStorage.setItem('appConfig', '{"theme":"dark"}')
  const changed = jest.fn()
  window.addEventListener(SETTINGS_EVENT, changed)
  const set = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
  try {
    expect(() => AppSettings.save('theme', 'light')).toThrow()
    expect(AppSettings.load().theme).toBe('dark')
    expect(changed).not.toHaveBeenCalled()
  } finally {
    set.mockRestore()
    window.removeEventListener(SETTINGS_EVENT, changed)
  }
})
