/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"https://tinybots.net/artbot?backup_lab=1"}
 */
import { render, screen } from '@testing-library/react'
import BackupReminder from '.'
import { HANDOFF_KEY } from 'app/_backup/platform'

jest.mock('next/navigation', () => ({ usePathname: () => '/artbot' }))
it('never displays the test reminder on the production origin, including with opt-in flags', () => {
  localStorage.setItem('ArtBotBackupLab', '1')
  localStorage.setItem(
    HANDOFF_KEY,
    JSON.stringify({ id: 'production', state: 'saving', verified: 1, total: 3 })
  )
  render(<BackupReminder />)
  expect(screen.queryByRole('link', { name: 'Continue backup' })).toBeNull()
})
