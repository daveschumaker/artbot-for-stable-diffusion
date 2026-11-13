'use client'
import { useEffect, useRef, useState } from 'react'
import Section from 'app/_components/Section'
import { Button } from 'app/_components/Button'
import { appBackup, previewBackup, withScreenAwake } from 'app/_backup'
import type { RestorePreview } from 'app/_backup'
import { selection } from 'app/_backup/platform'
import { db } from 'app/_db/dexie'
import { backupErrorMessage } from 'app/_backup/errors'
import { useBackupOperation } from '../BackupOperations'

const size = (bytes: number) =>
  bytes >= 1073741824
    ? (bytes / 1073741824).toFixed(1) + ' GB'
    : (bytes / 1048576).toFixed(1) + ' MB'
export default function ImportDatabase() {
  const operation = useBackupOperation()
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<RestorePreview | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [message, setMessage] = useState('')
  const [attempts, setAttempts] = useState<any[]>([])
  const [resumeId, setResumeId] = useState('')
  const [keys, setKeys] = useState(false)
  const [canRollback, setCanRollback] = useState(false)
  const [activeId, setActiveId] = useState('')
  const abort = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const disabled = busy || !!operation.active
  const refresh = async () => {
    setAttempts(await appBackup().restoreAttempts())
    setCanRollback(!!selection()?.restoreId)
    setActiveId(selection()?.restoreId || '')
  }
  useEffect(() => {
    void refresh()
      .then(async () => {
        if (selection()?.restoreId) {
          const report = (await appBackup().restoreAttempts()).find(
            (a) => a.id === selection()?.restoreId
          )
          setMessage(
            'ArtBot database imported! ' +
              (report?.recovered ?? 0) +
              ' records restored, ' +
              (report?.duplicates ?? 0) +
              ' duplicates skipped. The restored library was verified. Your previous library is retained below.'
          )
        }
      })
      .catch((error) => setMessage(backupErrorMessage(error)))
    return () => {
      abort.current?.abort()
    }
  }, [])
  const run = async (
    action: (signal: AbortSignal) => Promise<void>,
    label = 'Restoring library'
  ) => {
    const release = operation.begin(label)
    if (!release) return
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    const hidden = () => {
      if (document.hidden) controller.abort()
    }
    document.addEventListener('visibilitychange', hidden)
    try {
      await withScreenAwake(() => action(controller.signal))
    } catch (error) {
      setMessage(
        'Unable to import this database. Your existing data has been kept. ' +
          backupErrorMessage(error) +
          '. Multipart restores can resume; legacy JSON restores restart safely.'
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      abort.current = null
      await refresh().catch(() => {})
      setBusy(false)
      release()
    }
  }
  const inspect = async (selected: File[]) => {
    const release = operation.begin('Checking selected backup')
    if (!release) return
    const token = ++generation.current
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    setFiles(selected)
    setPreview(null)
    setPreviewError('')
    setKeys(false)
    setMessage('Checking selected backup files…')
    try {
      const result = await previewBackup(selected, controller.signal)
      if (token !== generation.current) return
      setPreview(result)
      setMessage(
        result.issues.length
          ? 'Unable to import this database. Your existing data has been kept. ' +
              result.issues.join(' ')
          : 'File list ready. File contents will be checked independently during restore.'
      )
    } catch (error) {
      if (token !== generation.current) return
      const detail = backupErrorMessage(error)
      setPreviewError(detail)
      setMessage(
        'Unable to import this database. Your existing data has been kept. ' +
          detail
      )
    } finally {
      if (token === generation.current) {
        abort.current = null
        setBusy(false)
      }
      release()
    }
  }
  const clearSelection = () => {
    generation.current++
    setFiles([])
    setPreview(null)
    setPreviewError('')
    setKeys(false)
    setMessage('')
  }
  const ready = !!preview && !preview.issues.length && !previewError
  return (
    <Section>
      <h3 id="restore-library" className="font-bold text-xl mb-2 scroll-mt-24">
        Restore a library
      </h3>
      <p className="text-sm mb-3">
        Choose a complete backup to open as a separate library. Your current
        library stays available for rollback, and restored image requests stay
        paused.
      </p>
      <label htmlFor="file-upload" className="text-sm font-bold">
        Choose backup files
      </label>
      <input
        id="file-upload"
        aria-label="Choose backup files"
        className="block my-3 max-w-full"
        type="file"
        multiple
        disabled={disabled}
        onClick={(e) => {
          e.currentTarget.value = ''
          clearSelection()
        }}
        onChange={(e) => {
          const selected = [...(e.currentTarget.files || [])]
          if (selected.length) void inspect(selected)
        }}
      />
      {!!files.length && (
        <div
          role="region"
          aria-label="Restore preview"
          data-backup-preflight={
            busy ? 'checking' : ready ? 'ready' : 'blocked'
          }
          className="rounded-lg border border-gray-300 dark:border-gray-700 p-4 my-4 text-sm"
        >
          <h4 className="font-bold mb-3">Selected backup</h4>
          <p>
            {files.length} files selected
            {resumeId ? ' to resume the chosen restore' : ''}.
          </p>
          {!preview && !previewError && <p>Reading the file list…</p>}
          {previewError && <p className="my-2">{previewError}</p>}
          {previewError ? (
            <Button
              disabled={disabled}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose backup files again
            </Button>
          ) : (
            !!preview?.issues.length && (
              <Button disabled={disabled} onClick={() => void inspect(files)}>
                Check files again
              </Button>
            )
          )}
          {preview && (
            <>
              <dl className="grid grid-cols-2 gap-2 my-3">
                <dt>Format</dt>
                <dd>
                  {preview.format === 'multipart'
                    ? 'ArtBot backup v1'
                    : 'Legacy JSON'}
                </dd>
                <dt>Created</dt>
                <dd>
                  {preview.createdAt &&
                  Number.isFinite(Date.parse(preview.createdAt))
                    ? new Date(preview.createdAt).toLocaleString()
                    : 'Not recorded'}
                </dd>
                <dt>Images</dt>
                <dd>{preview.images ?? 'Counted during restore'}</dd>
                {preview.records !== undefined && (
                  <>
                    <dt>Total records</dt>
                    <dd>{preview.records}</dd>
                  </>
                )}
                {preview.format === 'multipart' && (
                  <>
                    <dt>Parts selected</dt>
                    <dd>
                      {preview.selectedParts} of {preview.parts}
                    </dd>
                  </>
                )}
                <dt>Estimated space needed</dt>
                <dd>{size(preview.required)}</dd>
                <dt>Estimated space available</dt>
                <dd>
                  {preview.available === undefined
                    ? 'Unavailable'
                    : size(preview.available)}
                </dd>
                <dt>API keys</dt>
                <dd>
                  {preview.credentials
                    ? 'Included; restoring them is optional'
                    : preview.format === 'legacy'
                      ? 'This device keeps its keys'
                      : 'Excluded from this backup'}
                </dd>
              </dl>
              {!!preview.missing.length && (
                <div className="my-3">
                  <p className="font-bold">
                    Missing {preview.missing.length} backup parts:
                  </p>
                  <ul className="list-disc pl-5 break-all">
                    {preview.missing.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!preview.issues.length && (
                <ul className="my-3 list-disc pl-5">
                  {preview.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
              {ready && (
                <p className="my-3">
                  File list complete. Checksums and all records are checked
                  during restore before the new library opens. Allow room for
                  both libraries.
                </p>
              )}
            </>
          )}
        </div>
      )}
      {preview?.credentials && (
        <label className="block text-sm my-3">
          <input
            type="checkbox"
            checked={keys}
            disabled={disabled}
            onChange={(e) => setKeys(e.target.checked)}
          />{' '}
          Restore API keys from this private backup (otherwise keep this
          device’s keys)
        </label>
      )}
      <Button
        disabled={disabled || !ready}
        onClick={() =>
          void run(async (signal) => {
            setMessage('Checking backup files…')
            await appBackup().restore(files, {
              resumeId: resumeId || undefined,
              restoreCredentials: keys,
              signal,
              onProgress: (p) =>
                setMessage(
                  p.phase +
                    ': ' +
                    p.records +
                    (p.total ? ' / ' + p.total : '') +
                    ' records'
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
      <p role="status" aria-label="Restore status" className="text-sm my-3">
        {message}
      </p>
      {canRollback && (
        <div className="my-4 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
          <h4 className="font-bold mb-2">Your previous library is available</h4>
          <p className="text-sm mb-3">
            Return to the library and preferences you used before this restore.
          </p>
          <Button
            disabled={disabled}
            onClick={() =>
              void run(async () => {
                await appBackup().rollback()
                db.close()
                window.location.reload()
              }, 'Returning to previous library')
            }
          >
            Return to previous library
          </Button>
        </div>
      )}
      {resumeId && (
        <Button
          disabled={disabled}
          onClick={() => {
            setResumeId('')
            clearSelection()
          }}
        >
          Cancel resume selection
        </Button>
      )}
      {attempts.some(
        (a) =>
          a.id !== activeId &&
          ['paused', 'failed', 'staging', 'verified'].includes(a.status)
      ) && (
        <details
          className="my-4"
          open={attempts.some(
            (a) => a.id !== activeId && a.status === 'paused'
          )}
        >
          <summary className="font-bold cursor-pointer">
            Unfinished restores and cleanup
          </summary>
          {attempts
            .filter(
              (a) =>
                a.id !== activeId &&
                ['paused', 'failed', 'staging', 'verified'].includes(a.status)
            )
            .map((a) => (
              <div key={a.id} className="my-3 text-sm flex flex-wrap gap-2">
                <span>
                  {new Date(a.createdAt).toLocaleString()} · {a.status} ·{' '}
                  {a.error}
                </span>
                {a.format === 'multipart' && a.status !== 'failed' && (
                  <Button
                    disabled={disabled}
                    onClick={() => {
                      setResumeId(a.id)
                      clearSelection()
                      setMessage(
                        'Choose the same manifest and all parts, then resume restore.'
                      )
                    }}
                  >
                    Choose files to resume
                  </Button>
                )}
                <Button
                  disabled={disabled}
                  onClick={() =>
                    void run(async () => {
                      await appBackup().discardAttempt(a.id)
                      setResumeId('')
                      setMessage(
                        'Incomplete candidate removed. Your current library was kept.'
                      )
                    }, 'Removing incomplete restore')
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
