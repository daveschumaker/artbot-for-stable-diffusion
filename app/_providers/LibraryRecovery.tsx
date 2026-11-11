'use client'
import { ReactNode, useEffect, useState } from 'react'
import { appBackup } from 'app/_backup'

export default function LibraryRecovery({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let stopped = false
    appBackup()
      .recoverPreferences()
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
