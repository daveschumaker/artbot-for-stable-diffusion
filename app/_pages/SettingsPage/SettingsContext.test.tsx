/** @jest-environment jsdom */
import { useLayoutEffect } from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from './SettingsContext'
import AppSettings from 'app/_data-models/AppSettings'
jest.mock('app/_modules/AppTheme/controller', () => ({
  updateTheme: jest.fn()
}))
function Controls() {
  const { values, save } = useSettings()
  return (
    <>
      <span>{values.theme}</span>
      <button onClick={() => save('theme', 'dark')}>Dark</button>
    </>
  )
}
beforeEach(() => localStorage.clear())
it('updates the rendered value only after durable save succeeds', () => {
  render(
    <SettingsProvider>
      <Controls />
    </SettingsProvider>
  )
  fireEvent.click(screen.getByText('Dark'))
  expect(screen.getByText('dark')).toBeTruthy()
  expect(AppSettings.get('theme')).toBe('dark')
  expect(screen.getByRole('status').textContent).toContain('Saved')
})
it('keeps the rendered and persisted previous value on quota failure', () => {
  render(
    <SettingsProvider>
      <Controls />
    </SettingsProvider>
  )
  const set = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
  try {
    fireEvent.click(screen.getByText('Dark'))
    expect(screen.getByText('system')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain(
      'previous values were kept'
    )
  } finally {
    set.mockRestore()
  }
})
it('receives cross-window settings changes without a reload', () => {
  render(
    <SettingsProvider>
      <Controls />
    </SettingsProvider>
  )
  act(() => {
    localStorage.setItem('appConfig', '{"theme":"light"}')
    window.dispatchEvent(new StorageEvent('storage', { key: 'appConfig' }))
  })
  expect(screen.getByText('light')).toBeTruthy()
  expect(screen.getByRole('status').textContent).toContain('another window')
})

it('does not miss a storage update between first render and event subscription', () => {
  function ConcurrentWriter() {
    useLayoutEffect(() => {
      localStorage.setItem('appConfig', '{"theme":"light"}')
    }, [])
    return <Controls />
  }
  render(
    <SettingsProvider>
      <ConcurrentWriter />
    </SettingsProvider>
  )
  expect(screen.getByText('light')).toBeTruthy()
})
