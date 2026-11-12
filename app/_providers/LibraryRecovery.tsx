'use client'
import { ReactNode, useEffect, useState } from 'react'
import { browserStorage, SELECTION_KEY } from 'app/_backup/platform'

export default function LibraryRecovery({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let stopped = false
    // Ordinary startup needs only the journal check. An interrupted restore
    // still runs the manager's cross-tab recovery fence before rendering.
    const recover = async () => {
      if (!browserStorage()?.getItem(`${SELECTION_KEY}:transition`)) return
      const { appBackup } = await import('app/_backup')
      await appBackup().recoverPreferences()
    }
    recover()
      .then(() => {
        if (!stopped) setReady(true)
      })
      .catch(() => {
        if (!stopped)
          setError(
            'ArtBot could not finish recovering your library preferences. Free device space and try again. Your image libraries have been retained.'
          )
      })
    return () => {
      stopped = true
    }
  }, [])
  if (ready) return children
  return (
    <div role="status" className="p-6">
      {error || 'Opening your library…'}
      {error && (
        <button
          type="button"
          className="underline ml-3"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      )}
    </div>
  )
}
