'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HANDOFF_EVENT, HANDOFF_KEY } from 'app/_backup/platform'

// Deliberately local-only, including when running a local production build.
const localHost = (host: string) => {
  if (
    host === 'localhost' ||
    host === '[::1]' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local')
  )
    return true
  const parts = host.split('.')
  if (
    parts.length !== 4 ||
    parts.some((p) => !/^\d+$/.test(p) || Number(p) > 255)
  )
    return false
  const [a, b] = parts.map(Number)
  return (
    a === 127 ||
    a === 10 ||
    (a === 192 && b === 168) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 169 && b === 254)
  )
}

type Hint = { id: string; state: string; verified: number; total: number }

export default function BackupReminder() {
  const pathname = usePathname()
  const [hint, setHint] = useState<Hint | null>(null)
  useEffect(() => {
    const update = () => {
      try {
        if (!localHost(window.location.hostname.toLowerCase())) {
          setHint(null)
          return
        }
        const optIn = new URLSearchParams(window.location.search).get(
          'backup_lab'
        )
        if (optIn === '1') localStorage.setItem('ArtBotBackupLab', '1')
        if (optIn === '0') localStorage.removeItem('ArtBotBackupLab')
        if (localStorage.getItem('ArtBotBackupLab') !== '1') {
          setHint(null)
          return
        }
        const value = JSON.parse(localStorage.getItem(HANDOFF_KEY) || 'null')
        setHint(
          value &&
            typeof value.id === 'string' &&
            value.id.length <= 200 &&
            ['preparing', 'saving'].includes(value.state) &&
            Number.isSafeInteger(value.verified) &&
            Number.isSafeInteger(value.total) &&
            value.verified >= 0 &&
            value.total >= value.verified
            ? value
            : null
        )
      } catch {
        setHint(null)
      }
    }
    update()
    window.addEventListener('storage', update)
    window.addEventListener(HANDOFF_EVENT, update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener(HANDOFF_EVENT, update)
    }
  }, [])
  if (!hint || pathname?.endsWith('/settings')) return null
  return (
    <aside
      aria-label="Unfinished backup"
      className="my-3 rounded border border-sky-500 p-3 text-sm"
    >
      <p>
        {hint.state === 'preparing'
          ? 'Your backup preparation is unfinished.'
          : `Your backup still needs saved-file verification (${hint.verified} of ${hint.total} files checked).`}
      </p>
      <Link
        prefetch={false}
        className="underline font-bold"
        href={`/settings?panel=import-export&backup=${encodeURIComponent(
          hint.id
        )}`}
      >
        Continue backup
      </Link>
    </aside>
  )
}
