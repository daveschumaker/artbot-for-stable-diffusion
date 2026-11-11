'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'app/_components/Button'
import Section from 'app/_components/Section'
import {
  appBackup,
  requestPersistence,
  storageStatus,
  withScreenAwake
} from 'app/_backup'
import type { Progress } from 'app/_backup'
import { downloadBlob } from 'app/_utils/appUtils'

const size = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`
export default function ExportDatabase() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('')
  const [jobs, setJobs] = useState<any[]>([]),
    [files, setFiles] = useState<File[]>([])
  const [capacity, setCapacity] = useState<
    Partial<Awaited<ReturnType<typeof storageStatus>>>
  >({})
  const [lastVerified, setLastVerified] = useState(''),
    [requested, setRequested] = useState<string[]>([])
  const [limit, setLimit] = useState(8),
    [keys, setKeys] = useState(false)
  const [fileJob, setFileJob] = useState<{
    createdAt: string
    includeCredentials: boolean
  } | null>(null)
  const abort = useRef<AbortController | null>(null)
  const refresh = async () => {
    setJobs(await appBackup().preparations())
    setCapacity(await storageStatus())
    const saved = localStorage.getItem('ArtBotLibrarySelection:lastVerified')
    if (saved) {
      const result = JSON.parse(saved)
      setLastVerified(
        `${result.records} records checked on ${new Date(
          result.time
        ).toLocaleString()}`
      )
    }
  }
  useEffect(() => {
    let stopped = false
    refresh()
      .then(async () => {
        const latest = (await appBackup().preparations())
          .filter((job) => job.status === 'complete')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
        if (!latest) return
        const savedFiles = await appBackup().files(latest.id)
        if (!stopped) {
          setFiles(savedFiles)
          setFileJob(latest)
          setMessage(
            'Recovered prepared backup. Save the remaining files, then verify the saved copies.'
          )
        }
      })
      .catch((e) => {
        if (!stopped) setMessage(e.message)
      })
    return () => {
      stopped = true
      abort.current?.abort()
    }
  }, [])
  const run = async (action: (signal: AbortSignal) => Promise<void>) => {
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    setMessage('')
    const hidden = () => {
      if (document.hidden) controller.abort()
    }
    document.addEventListener('visibilitychange', hidden)
    try {
      await withScreenAwake(() => action(controller.signal))
    } catch (e) {
      setMessage(
        (e as Error).name === 'AbortError'
          ? 'Paused. Resume preparation below; keep this window visible.'
          : (e as Error).message
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      setBusy(false)
      abort.current = null
      await refresh().catch(() => {})
    }
  }
  const progress = (p: Progress) =>
    setMessage(
      `${p.phase}: ${p.records}${
        p.total ? ` / ${p.total}` : ''
      } records, ${size(p.bytes)}`
    )
  const prepare = (resumeId?: string) =>
    run(async (signal) => {
      setFiles([])
      setRequested([])
      const job = await appBackup().prepare({
        resumeId,
        maxPartBytes: limit * 1048576,
        includeCredentials: keys,
        signal,
        onProgress: progress
      })
      setFiles(await appBackup().files(job.id))
      setFileJob(job)
      setMessage(
        'Prepared locally. Save the manifest and every part, then select the saved files to verify them.'
      )
    })
  return (
    <Section>
      <h3 className="font-bold mb-2">Back up this library</h3>
      <p className="text-sm mb-2">
        Includes all database tables, source images, masks, favorites and saved
        preferences. Keep ArtBot visible while preparing. Interrupted
        preparation can resume.
      </p>
      <p className="text-xs mb-2">
        Storage:{' '}
        {capacity.usage === undefined
          ? 'estimate unavailable'
          : `${size(capacity.usage)} used / ${size(
              capacity.quota || 0
            )} estimated quota`}
        .{' '}
        {capacity.persisted
          ? 'Persistent storage granted.'
          : 'Browser storage can be evicted; keep a copy outside this browser.'}
      </p>
      {!capacity.persisted && (
        <Button
          disabled={busy}
          onClick={() =>
            run(async () => {
              const granted = await requestPersistence()
              setMessage(
                granted
                  ? 'Persistent storage granted.'
                  : 'Persistence was not granted. Saved files outside this browser remain essential.'
              )
            })
          }
        >
          Request persistent storage
        </Button>
      )}
      <div className="flex flex-wrap gap-3 my-3 items-center">
        <label>
          Maximum part size{' '}
          <select
            aria-label="Maximum backup part size"
            disabled={busy}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[8, 32, 64].map((n) => (
              <option key={n} value={n}>
                {n} MB
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            disabled={busy}
            checked={keys}
            onChange={(e) => setKeys(e.target.checked)}
          />{' '}
          Include API keys in new backup
        </label>
        <Button disabled={busy} onClick={() => prepare()}>
          Prepare backup
        </Button>
        {busy && (
          <Button onClick={() => abort.current?.abort()}>
            Pause operation
          </Button>
        )}
      </div>
      <p role="status" className="text-sm my-2">
        {message}
      </p>
      {jobs.length > 0 && (
        <details className="my-3">
          <summary>Saved preparations ({jobs.length})</summary>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="my-2 text-sm flex flex-wrap gap-2 items-center"
            >
              <span>
                {new Date(job.createdAt).toLocaleString()} · {job.records}{' '}
                records · {job.status}
              </span>
              {job.status === 'complete' ? (
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      setFiles(await appBackup().files(job.id))
                      setFileJob(job)
                      setRequested([])
                      setMessage(
                        'Save all listed files, then verify the saved copies.'
                      )
                    })
                  }
                >
                  Show files
                </Button>
              ) : (
                <Button disabled={busy} onClick={() => prepare(job.id)}>
                  Resume preparation
                </Button>
              )}
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await appBackup().discardPreparation(job.id)
                    setFiles([])
                    setMessage(
                      'Local preparation removed. Saved files and the image library are unchanged.'
                    )
                  })
                }
              >
                Remove preparation
              </Button>
            </div>
          ))}
        </details>
      )}
      {!!files.length && (
        <div className="my-3">
          <p className="font-bold text-sm mb-2">
            Prepared{' '}
            {fileJob ? new Date(fileJob.createdAt).toLocaleString() : ''}.{' '}
            {fileJob?.includeCredentials
              ? 'This prepared backup includes API keys. Keep it private.'
              : 'API keys are excluded from this prepared backup.'}
          </p>
          <p>
            {files.length} files. Save every file into one folder. Download
            requested means the browser was asked to save; verify the actual
            saved copies below.
          </p>
          <ul>
            {files.map((file) => (
              <li className="my-2" key={file.name}>
                <Button
                  disabled={busy}
                  onClick={() => {
                    downloadBlob(file, file.name)
                    setRequested((old) => [...old, file.name])
                  }}
                >
                  Save{' '}
                  {file.name.endsWith('.manifest.json')
                    ? 'manifest'
                    : `part ${files.indexOf(file)}`}{' '}
                  ({size(file.size)})
                </Button>{' '}
                {typeof navigator !== 'undefined' &&
                  navigator.canShare?.({ files: [file] }) && (
                    <Button
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await navigator.share({
                            files: [file],
                            title: 'ArtBot backup'
                          })
                          setMessage(
                            'Share sheet closed. Select the copies saved to Files below to verify them.'
                          )
                        } catch (e) {
                          setMessage(
                            (e as Error).name === 'AbortError'
                              ? 'Share cancelled. The prepared file is still available.'
                              : (e as Error).message
                          )
                        }
                      }}
                    >
                      Share/save{' '}
                      {file.name.endsWith('.manifest.json')
                        ? 'manifest'
                        : `part ${files.indexOf(file)}`}
                    </Button>
                  )}
                {requested.includes(file.name) && 'Download requested'}
              </li>
            ))}
          </ul>
          {typeof window !== 'undefined' && 'showDirectoryPicker' in window && (
            <Button
              disabled={busy}
              onClick={async () => {
                // Open the picker directly from the click's user activation.
                try {
                  const directory = await (window as any).showDirectoryPicker({
                    mode: 'readwrite'
                  })
                  await run(async (signal) => {
                    for (const file of files) {
                      const handle = await directory.getFileHandle(file.name, {
                        create: true
                      })
                      await file
                        .stream()
                        .pipeTo(await handle.createWritable(), { signal })
                    }
                    setMessage(
                      'Files written to the selected folder. Select those saved copies below to verify them.'
                    )
                  })
                } catch (error) {
                  setMessage(
                    (error as Error).name === 'AbortError'
                      ? 'Folder selection cancelled.'
                      : (error as Error).message
                  )
                }
              }}
            >
              Save all to a folder
            </Button>
          )}
        </div>
      )}
      <label className="block my-3">
        Verify saved backup (manifest and all parts)
        <input
          aria-label="Verify saved backup"
          type="file"
          multiple
          disabled={busy}
          onChange={(e) => {
            const selected = [...(e.target.files || [])]
            e.target.value = ''
            if (selected.length)
              run(async (signal) => {
                const manifest = await appBackup().verify(selected, signal)
                setMessage(
                  `Saved backup verified: ${manifest.records} records, ${manifest.parts.length} parts. Keep these files outside browser storage.${manifest.verificationRecorded ? '' : ' The local verification timestamp could not be saved.'}`
                )
              })
          }}
        />
      </label>
      <p className="text-xs">
        Last saved-file verification: {lastVerified || 'none on this device'}
      </p>
      <details className="mt-4">
        <summary>Legacy compatibility JSON export</summary>
        <p className="text-sm my-2">
          For older ArtBot versions. Includes database records but not
          preferences. Creates one large file and may exceed mobile memory
          limits. Use the multipart backup above for large libraries.
        </p>
        <Button
          disabled={busy}
          onClick={() =>
            run(async () => {
              const file = await appBackup().exportCompatibility((p) =>
                setMessage(`Exporting ${p.completedRows} / ${p.totalRows} rows`)
              )
              downloadBlob(file, `artbot-db_${Date.now()}.json`)
              setMessage(
                'Compatibility JSON download requested. Verify the saved file by restoring it into a separate test library.'
              )
            })
          }
        >
          Download database
        </Button>
      </details>
    </Section>
  )
}
