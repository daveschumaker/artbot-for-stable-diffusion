'use client'
import { useEffect, useRef, useState } from 'react'
import Section from 'app/_components/Section'
import { Button } from 'app/_components/Button'
import { appBackup, withScreenAwake } from 'app/_backup'
import { selection } from 'app/_backup/platform'
import { db } from 'app/_db/dexie'

export default function ImportDatabase() {
  const [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(''),
    [attempts, setAttempts] = useState<any[]>([])
  const [resumeId, setResumeId] = useState(''),
    [keys, setKeys] = useState(false),
    [hasKeys, setHasKeys] = useState(false)
  const [canRollback, setCanRollback] = useState(false),
    [activeId, setActiveId] = useState('')
  const abort = useRef<AbortController | null>(null)
  const refresh = async () => {
    setAttempts(await appBackup().restoreAttempts())
    setCanRollback(!!selection()?.restoreId)
    setActiveId(selection()?.restoreId || '')
  }
  useEffect(() => {
    refresh()
      .then(async () => {
        if (selection()?.restoreId) {
          const report = (await appBackup().restoreAttempts()).find(
            (a) => a.id === selection()?.restoreId
          )
          setMessage(
            `ArtBot database imported! ${
              report?.recovered ?? 0
            } records restored, ${
              report?.duplicates ?? 0
            } duplicates skipped. The restored library was verified. Your previous library is retained below.`
          )
        }
      })
      .catch((e) => setMessage(e.message))
    return () => abort.current?.abort()
  }, [])
  const run = async (action: (signal: AbortSignal) => Promise<void>) => {
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    const hidden = () => {
      if (document.hidden) controller.abort()
    }
    document.addEventListener('visibilitychange', hidden)
    try {
      await withScreenAwake(() => action(controller.signal))
    } catch (e) {
      setMessage(
        `Unable to import this database. Your existing data has been kept. ${
          (e as Error).message
        }. Multipart restores can resume; legacy JSON restores restart safely.`
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      setBusy(false)
      abort.current = null
      await refresh().catch(() => {})
    }
  }
  return (
    <Section>
      <h3 className="font-bold mb-2">Restore a library</h3>
      <p className="text-sm mb-2">
        Select a backup manifest and every part, or one legacy JSON file. ArtBot
        builds and verifies a separate library before opening it. Your current
        library stays available for rollback. Raw legacy image arrays merge into
        a staged copy and report duplicates.
      </p>
      <p className="text-sm mb-2">
        Allow room for both libraries. Restored image requests stay paused until
        you choose to resume them.
      </p>
      <label htmlFor="file-upload">Choose backup files</label>
      <input
        id="file-upload"
        aria-label="Choose backup files"
        className="block my-2"
        type="file"
        multiple
        disabled={busy}
        onChange={async (e) => {
          const selected = [...(e.target.files || [])]
          setFiles(selected)
          setHasKeys(false)
          setKeys(false)
          const manifest = selected.find((file) =>
            file.name.endsWith('.manifest.json')
          )
          try {
            if (manifest && manifest.size <= 1048576)
              setHasKeys(
                JSON.parse(await manifest.text()).credentialsIncluded === true
              )
          } catch {
            setMessage('The manifest is unreadable. Choose a complete backup.')
          }
        }}
      />
      {!!files.length && (
        <p className="text-sm">
          {files.length} files selected
          {resumeId ? ' to resume the chosen restore' : ''}.
        </p>
      )}
      {hasKeys && (
        <label className="block my-2">
          <input
            type="checkbox"
            checked={keys}
            disabled={busy}
            onChange={(e) => setKeys(e.target.checked)}
          />{' '}
          Restore API keys from this private backup (otherwise keep this
          device’s keys)
        </label>
      )}
      <Button
        disabled={busy || !files.length}
        onClick={() =>
          run(async (signal) => {
            setMessage('Checking backup files…')
            await appBackup().restore(files, {
              resumeId: resumeId || undefined,
              restoreCredentials: keys,
              signal,
              onProgress: (p) =>
                setMessage(
                  `${p.phase}: ${p.records}${
                    p.total ? ` / ${p.total}` : ''
                  } records`
                )
            })
            db.close()
            window.location.reload()
          })
        }
      >
        {resumeId ? 'Resume restore' : 'Restore library'}
      </Button>
      {busy && (
        <Button onClick={() => abort.current?.abort()}>Pause restore</Button>
      )}
      <p role="status" className="text-sm my-3">
        {message}
      </p>
      {canRollback && (
        <Button
          disabled={busy}
          onClick={() =>
            run(async () => {
              await appBackup().rollback()
              db.close()
              window.location.reload()
            })
          }
        >
          Return to previous library
        </Button>
      )}
      {attempts.some(
        (a) =>
          a.id !== activeId &&
          ['paused', 'failed', 'staging', 'verified'].includes(a.status)
      ) && (
        <details className="my-3">
          <summary>Incomplete restores</summary>
          {attempts
            .filter(
              (a) =>
                a.id !== activeId &&
                ['paused', 'failed', 'staging', 'verified'].includes(a.status)
            )
            .map((a) => (
              <div key={a.id} className="my-2 text-sm flex flex-wrap gap-2">
                <span>
                  {new Date(a.createdAt).toLocaleString()} · {a.status} ·{' '}
                  {a.error}
                </span>
                {a.format === 'multipart' && a.status !== 'failed' && (
                  <Button
                    disabled={busy}
                    onClick={() => {
                      setResumeId(a.id)
                      setFiles([])
                      setMessage(
                        'Choose the same manifest and all parts, then resume restore.'
                      )
                    }}
                  >
                    Choose files to resume
                  </Button>
                )}
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await appBackup().discardAttempt(a.id)
                      setMessage(
                        'Incomplete candidate removed. Your current library was kept.'
                      )
                      setResumeId('')
                    })
                  }
                >
                  Remove incomplete restore
                </Button>
              </div>
            ))}
        </details>
      )}
    </Section>
  )
}
