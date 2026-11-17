'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageTitle from 'app/_components/PageTitle'
import { SettingsProvider } from './SettingsContext'
import { BackupOperations } from './BackupOperations'

const loading = () => <p role="status">Loading settings…</p>
const Account = dynamic(() => import('./AiHordeSettingsPanel'), { loading })
const Generation = dynamic(() => import('./GenerationSettingsPanel'), {
  loading
})
const Preferences = dynamic(() => import('./ArtBotSettingsPanel'), { loading })
const Workers = dynamic(() => import('./WorkerSettingsPanel'), { loading })
const Backup = dynamic(() => import('./ImportExportPanel'), { loading })
const Maintenance = dynamic(() => import('./MaintenancePanel'), { loading })
const sections = [
  { id: '', label: 'Account & AI Horde' },
  { id: 'generation', label: 'Generation' },
  { id: 'prefs', label: 'Gallery & Appearance' },
  { id: 'workers', label: 'Workers' },
  { id: 'import-export', label: 'Backups & Storage' },
  { id: 'advanced', label: 'Troubleshooting' }
]
export default function SettingsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const requested = params?.get('panel') || ''
  const panel =
    requested === 'worker'
      ? 'workers'
      : sections.some((section) => section.id === requested)
        ? requested
        : ''
  useEffect(() => {
    const oldAnchor = () => {
      if (
        window.location.hash === '#use-specific-workers' &&
        !window.location.search.includes('panel=generation')
      )
        router.replace('/settings?panel=generation#use-specific-workers')
    }
    oldAnchor()
    window.addEventListener('hashchange', oldAnchor)
    return () => window.removeEventListener('hashchange', oldAnchor)
  }, [router])
  const href = (id: string) => (id ? `/settings?panel=${id}` : '/settings')
  return (
    <div className="pb-24">
      <PageTitle>Settings</PageTitle>
      <div className="md:flex md:gap-6 mt-4">
        <nav
          aria-label="Settings sections"
          className="md:w-56 md:shrink-0 mb-5"
        >
          <div className="md:hidden">
            <label htmlFor="settings-section" className="text-sm font-bold">
              Settings section
            </label>
            <select
              id="settings-section"
              value={panel}
              onChange={(event) => router.push(href(event.target.value))}
              className="block w-full p-3 mt-2 rounded border border-gray-400 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
          <ul className="hidden md:flex md:flex-col md:gap-2 md:sticky md:top-24">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  prefetch={false}
                  href={href(section.id)}
                  aria-current={panel === section.id ? 'page' : undefined}
                  className={
                    'block rounded px-3 py-2 text-sm ' +
                    (panel === section.id
                      ? 'bg-teal-600 text-white font-bold'
                      : 'hover:underline')
                  }
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">
          {requested &&
            requested !== 'worker' &&
            !sections.some((section) => section.id === requested) && (
              <p role="status">
                That settings section was not found. Showing account settings.
              </p>
            )}
          <BackupOperations>
            <SettingsProvider>
              {panel === '' && <Account />}
              {panel === 'generation' && <Generation />}
              {panel === 'prefs' && <Preferences />}
              {panel === 'workers' && <Workers />}
              {panel === 'import-export' && <Backup />}
              {panel === 'advanced' && <Maintenance />}
            </SettingsProvider>
          </BackupOperations>
        </div>
      </div>
    </div>
  )
}
