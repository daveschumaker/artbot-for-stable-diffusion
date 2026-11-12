/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://localhost/artbot"}
 */
import { render, screen, cleanup } from '@testing-library/react'
import BackupReminder from '.'
import { HANDOFF_KEY } from 'app/_backup/platform'

jest.mock('next/navigation', () => ({ usePathname: () => '/artbot' }))
beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/artbot')
  localStorage.setItem(
    HANDOFF_KEY,
    JSON.stringify({ id: 'local-test', state: 'saving', verified: 1, total: 3 })
  )
})
afterEach(cleanup)
it('keeps the reminder off by default even with an unfinished backup', () => {
  render(<BackupReminder />)
  expect(screen.queryByRole('link', { name: 'Continue backup' })).toBeNull()
})
it('allows an explicit local test opt-in and retains it for the next launch', () => {
  window.history.replaceState(null, '', '/artbot?backup_lab=1')
  render(<BackupReminder />)
  expect(
    screen.getByRole('link', { name: 'Continue backup' }).getAttribute('href')
  ).toContain('backup=local-test')
  cleanup()
  window.history.replaceState(null, '', '/artbot')
  render(<BackupReminder />)
  expect(screen.getByRole('link', { name: 'Continue backup' })).toBeTruthy()
})
