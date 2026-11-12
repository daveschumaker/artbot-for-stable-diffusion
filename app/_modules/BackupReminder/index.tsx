'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HANDOFF_EVENT, HANDOFF_KEY } from 'app/_backup/platform'

type Hint = { id: string; state: string; verified: number; total: number }

export default function BackupReminder() {
  const pathname = usePathname()
  const [hint, setHint] = useState<Hint | null>(null)
  useEffect(() => {
    const update = () => {
      try {
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
