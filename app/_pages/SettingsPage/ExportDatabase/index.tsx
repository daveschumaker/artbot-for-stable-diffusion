'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from 'app/_components/Button'
import Section from 'app/_components/Section'
import styles from './exportDatabase.module.css'
import {
  appBackup,
  requestPersistence,
  storageStatus,
  withScreenAwake
} from 'app/_backup'
import type { BackupInventory, Progress } from 'app/_backup'
import { backupErrorMessage } from 'app/_backup/errors'
import { downloadBlob } from 'app/_utils/appUtils'
import { useBackupOperation } from '../BackupOperations'

const size = (bytes: number) =>
  bytes >= 1073741824
    ? (bytes / 1073741824).toFixed(1) + ' GB'
    : (bytes / 1048576).toFixed(1) + ' MB'
export default function ExportDatabase() {
  const selectedId = useSearchParams()?.get('backup')
  const operation = useBackupOperation()
  const [busy, setBusy] = useState(false)
  const disabled = busy || !!operation.active
  const [message, setMessage] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [inventory, setInventory] = useState<BackupInventory | null>(null)
  const [ready, setReady] = useState<{ id: string; file: File } | null>(null)
  const [capacity, setCapacity] = useState<
    Partial<Awaited<ReturnType<typeof storageStatus>>>
  >({})
  const [lastVerified, setLastVerified] = useState('')
  const [limit, setLimit] = useState(8)
  const [keys, setKeys] = useState(false)
  const activePreparation = useRef<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  const refresh = async () => {
    setJobs(await appBackup().preparations())
    setCapacity(await storageStatus())
    const id = activePreparation.current
    if (id) {
      const value = await appBackup().inventory(id)
      if (activePreparation.current === id) setInventory(value)
    }
    const saved = localStorage.getItem('ArtBotLibrarySelection:lastVerified')
    if (saved) {
      const result = JSON.parse(saved)
      setLastVerified(
        result.records +
          ' records checked on ' +
          new Date(result.time).toLocaleString()
      )
    }
  }
  const showPreparation = async (id: string) => {
    setReady(null)
    const info = await appBackup().inventory(id)
    activePreparation.current = info.id
    setInventory(info)
    const file = await appBackup().file(id, info.files[0].name)
    setReady({ id, file })
  }
  useEffect(() => {
    let stopped = false
    const open = async () => {
      const preparations = await appBackup().preparations()
      const capacity = await storageStatus()
      const latest = selectedId
        ? preparations.find((job) => job.id === selectedId)
        : preparations
            .filter((job) => job.status === 'complete')
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
      let info: BackupInventory | null = null
      let file: File | null = null
      if (latest?.status === 'complete') {
        info = await appBackup().inventory(latest.id)
        // Opening the inventory constructs only the small manifest.
        file = await appBackup().file(latest.id, info.files[0].name)
      }
      if (stopped) return
      setJobs(preparations)
      setCapacity(capacity)
      activePreparation.current = info?.id || null
      setInventory(info)
      setReady(info && file ? { id: info.id, file } : null)
      const saved = localStorage.getItem('ArtBotLibrarySelection:lastVerified')
      if (saved) {
        const value = JSON.parse(saved)
        setLastVerified(
          value.records +
            ' records checked on ' +
            new Date(value.time).toLocaleString()
        )
      }
      if (info)
        setMessage(
          'Recovered prepared backup. Continue saving or verifying the copies below.'
        )
    }
    void open().catch((error) => {
      if (!stopped) setMessage(backupErrorMessage(error))
    })
    return () => {
      stopped = true
      abort.current?.abort()
    }
  }, [selectedId])
  const run = async (
    action: (signal: AbortSignal) => Promise<void>,
    label = 'Backup operation'
  ) => {
    const release = operation.begin(label)
    if (!release) return
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
    } catch (error) {
      setMessage(
        (error as Error).name === 'AbortError'
          ? 'Paused. Your preparation and verified-file progress are kept. Keep this window visible and try again.'
          : backupErrorMessage(error)
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      abort.current = null
      await refresh().catch(() => {})
      setBusy(false)
      release()
    }
  }
  const progress = (p: Progress) =>
    setMessage(
      p.phase +
        ': ' +
        p.records +
        (p.total ? ' / ' + p.total : '') +
        ' records, ' +
        size(p.bytes)
    )
  const prepare = (resumeId?: string) =>
    run(async (signal) => {
      setReady(null)
      const job = await appBackup().prepare({
        resumeId,
        maxPartBytes: limit * 1048576,
        includeCredentials: keys,
        signal,
        onProgress: progress
      })
      await showPreparation(job.id)
      setMessage(
        'Prepared locally. Save the manifest and every part, then verify the copies saved outside ArtBot.'
      )
    }, 'Preparing backup')
  const selectFile = (name: string) => {
    if (!inventory) return
    void run(async (signal) => {
      setReady(null)
      const file = await appBackup().file(inventory.id, name)
      if (signal.aborted) throw new DOMException('Paused', 'AbortError')
      setReady({ id: inventory.id, file })
      setMessage(
        'Ready to save. Use a save button below, then verify the saved copy.'
      )
    }, 'Loading backup file')
  }
  const saveFile = async (share: boolean) => {
    if (!inventory || !ready || ready.id !== inventory.id) return
    const release = operation.begin(
      share ? 'Sharing backup file' : 'Saving backup file'
    )
    if (!release) return
    setBusy(true)
    const file = ready.file
    let request: Promise<void> | undefined
    try {
      // No awaited database read before share: iOS needs this user gesture.
      request = appBackup()
        .noteSaveRequested(inventory.id, file.name)
        .catch(() => {})
      if (share) {
        await navigator.share({ files: [file] })
        setMessage(
          'Share sheet closed. Verify the copies saved to Files below.'
        )
      } else {
        downloadBlob(file, file.name)
        setMessage(
          'Save requested. Select the actual saved copy below to verify it.'
        )
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        await request
        await appBackup()
          .noteSaveCancelled(inventory.id, file.name)
          .catch(() => {})
      }
      setMessage(
        (error as Error).name === 'AbortError'
          ? 'Share cancelled. This file still needs a saved copy and verification.'
          : backupErrorMessage(error)
      )
    } finally {
      await refresh().catch(() => {})
      setBusy(false)
      release()
    }
  }
  const saveFolder = async () => {
    if (!inventory) return
    const release = operation.begin('Saving backup folder')
    if (!release) return
    setReady(null)
    setBusy(true)
    const controller = new AbortController()
    abort.current = controller
    try {
      const directory = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      })
      await withScreenAwake(async () => {
        for (const entry of inventory.files) {
          if (controller.signal.aborted)
            throw new DOMException('Paused', 'AbortError')
          setMessage('Saving ' + entry.label + ' to the selected folder…')
          const file = await appBackup().file(inventory.id, entry.name)
          const handle = await directory.getFileHandle(entry.name, {
            create: true
          })
          await file.stream().pipeTo(await handle.createWritable(), {
            signal: controller.signal
          })
          await appBackup().noteSaveRequested(inventory.id, entry.name)
        }
      })
      setMessage(
        'Files written to the selected folder. Verify the saved copies below.'
      )
    } catch (error) {
      setMessage(
        (error as Error).name === 'AbortError'
          ? 'Folder save paused or cancelled. Saved files and verification progress are kept.'
          : backupErrorMessage(error)
      )
    } finally {
      abort.current = null
      await refresh().catch(() => {})
      setBusy(false)
      release()
    }
  }
  const verified = inventory?.files.filter((file) => file.verified).length || 0
  const next = inventory?.files.find(
    (file) => !file.requested && !file.verified
  )
  const current = inventory?.files.find(
    (entry) => entry.name === ready?.file.name
  )
  const step = !inventory ? 1 : next ? 2 : 3
  return (
    <Section className={styles.backup}>
      <h3 id="backup-library" className={styles.title}>
        Back up this library
      </h3>
      <p className={styles.intro}>
        Save your images, sources, masks, favorites and preferences together.
      </p>
      <ol aria-label="Backup steps" className={styles.stepper}>
        {['Prepare', 'Save files', 'Verify'].map((label, index) => (
          <li
            key={label}
            aria-current={
              step === index + 1 && !inventory?.complete ? 'step' : undefined
            }
            data-complete={
              inventory?.complete || step > index + 1 ? true : undefined
            }
          >
            <a href={'#backup-' + ['prepare', 'save', 'verify'][index]}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ol>
      <p role="status" aria-label="Backup status" className={styles.status}>
        {message}
      </p>
      {busy && abort.current && (
        <Button onClick={() => abort.current?.abort()}>Pause operation</Button>
      )}
      <div className={styles.workflow}>
        <div
          className={styles.stage}
          data-active={step === 1 && !inventory?.complete ? true : undefined}
        >
          <h4 id="backup-prepare" className={styles.stageTitle}>
            1. Prepare a backup
          </h4>
          <p className={styles.description}>
            {inventory
              ? 'Your backup is prepared. Continue with the files below.'
              : 'Keep ArtBot visible. If interrupted, you can resume.'}
          </p>
          <Button
            className={
              inventory ? styles.secondaryButton : styles.primaryButton
            }
            disabled={disabled}
            onClick={() => void prepare()}
          >
            Prepare backup
          </Button>
          {jobs
            .filter((job) => job.status !== 'complete')
            .map((job) => (
              <div key={job.id} className="my-3 text-sm">
                <span>
                  {new Date(job.createdAt).toLocaleString()} · {job.status} ·{' '}
                  {job.records} records{' '}
                </span>
                <Button
                  disabled={disabled}
                  onClick={() => void prepare(job.id)}
                >
                  Resume preparation
                </Button>
              </div>
            ))}
        </div>
        <div
          className={styles.stage}
          data-active={step === 2 ? true : undefined}
        >
          <h4 id="backup-save" className={styles.stageTitle}>
            2. Save every file into one folder
          </h4>
          {!inventory && (
            <p className={styles.placeholder}>
              Prepare a backup first. Your files will appear here.
            </p>
          )}
          {inventory && (
            <div role="region" aria-label="Backup file checklist">
              <p className="text-sm">
                {inventory.images} images · {inventory.records} total records ·{' '}
                {inventory.files.length} files ·{' '}
                {size(
                  inventory.files.reduce((sum, entry) => sum + entry.size, 0)
                )}
              </p>
              <p className={styles.description}>
                Prepared {new Date(inventory.createdAt).toLocaleString()}.{' '}
                {inventory.includeCredentials
                  ? 'This prepared backup includes API keys. Keep it private.'
                  : 'API keys are excluded from this prepared backup.'}
              </p>
              <p className={styles.nextAction}>
                {inventory.complete
                  ? 'All saved copies verified.'
                  : next
                    ? 'Next: select and save ' + next.label + '.'
                    : 'Next: verify the copies saved to Files.'}
              </p>
              {next && next.name !== current?.name && (
                <Button
                  disabled={disabled}
                  onClick={() => selectFile(next.name)}
                >
                  Load next file: {next.label}
                </Button>
              )}
              {ready && current && (
                <div className={styles.selectedFile}>
                  <p className="font-bold mb-1 capitalize">
                    Selected: {current.label}
                  </p>
                  <p className="text-xs break-all mb-3">{ready.file.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className={styles.primaryButton}
                      disabled={disabled}
                      onClick={() => void saveFile(false)}
                    >
                      Save {current.label} ({size(current.size)})
                    </Button>
                    {typeof navigator !== 'undefined' &&
                      navigator.canShare?.({ files: [ready.file] }) && (
                        <Button
                          disabled={disabled}
                          onClick={() => void saveFile(true)}
                        >
                          Share/save {current.label}
                        </Button>
                      )}
                  </div>
                </div>
              )}
              <p className={styles.description}>
                Save the manifest and every part. A save request still needs
                verification in step 3.
              </p>
              <details className="my-3" open={inventory.files.length <= 5}>
                <summary className="font-bold cursor-pointer py-2">
                  All backup files
                </summary>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {inventory.files.map((entry) => (
                    <li
                      key={entry.name}
                      data-backup-file-name={entry.name}
                      data-backup-file-label={entry.label}
                      className="py-3 flex flex-wrap gap-2 items-center"
                    >
                      <span className="font-bold capitalize">
                        {entry.label}
                      </span>
                      <span className="text-sm">{size(entry.size)}</span>
                      <span className="text-sm flex-1">
                        {entry.verified
                          ? 'Saved copy verified'
                          : entry.requested
                            ? 'Save requested (not verified)'
                            : 'Needs saving'}
                      </span>
                      <Button
                        disabled={disabled || current?.name === entry.name}
                        onClick={() => selectFile(entry.name)}
                      >
                        Select {entry.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </details>
              {typeof window !== 'undefined' &&
                'showDirectoryPicker' in window && (
                  <div className="mt-3">
                    <Button
                      disabled={disabled}
                      onClick={() => void saveFolder()}
                    >
                      Save all to a folder
                    </Button>
                  </div>
                )}
            </div>
          )}
        </div>
        <div
          className={styles.stage}
          data-active={step === 3 && !inventory?.complete ? true : undefined}
        >
          <h4 id="backup-verify" className={styles.stageTitle}>
            3. Verify the saved copies
          </h4>
          {inventory && (
            <p
              role="status"
              aria-label="Saved-file verification progress"
              className="font-bold text-sm mb-2"
            >
              {verified} of {inventory.files.length} saved files verified
              {inventory.complete
                ? ' — backup verified.'
                : '. Progress is kept if you leave.'}
            </p>
          )}
          <p className={styles.description}>
            {inventory
              ? 'Choose your saved copies from Files or Downloads. You can check a few files at a time.'
              : 'Already have a saved backup? Choose its files to check them.'}
          </p>
          <label className={styles.fileLabel}>
            <span className="sr-only">Verify saved backup</span>
            <input
              aria-label="Verify saved backup"
              type="file"
              multiple
              className={styles.fileInput}
              disabled={disabled}
              onClick={(e) => {
                e.currentTarget.value = ''
              }}
              onChange={(e) => {
                const selected = [...(e.currentTarget.files || [])]
                if (selected.length)
                  void run(async (signal) => {
                    if (
                      inventory &&
                      selected.every((file) =>
                        inventory.files.some(
                          (entry) => entry.name === file.name
                        )
                      )
                    ) {
                      const result = await appBackup().verifySavedFiles(
                        inventory.id,
                        selected,
                        signal
                      )
                      setInventory(await appBackup().inventory(inventory.id))
                      setMessage(
                        result.complete
                          ? 'Saved backup verified: ' +
                              result.records +
                              ' records, ' +
                              (result.files.length - 1) +
                              ' parts. Keep these files outside browser storage.' +
                              (result.verificationRecorded
                                ? ''
                                : ' The local verification timestamp could not be saved.')
                          : 'Verified ' +
                              result.files.filter((file) => file.verified)
                                .length +
                              ' of ' +
                              result.files.length +
                              ' saved files. Select another batch to continue.'
                      )
                    } else {
                      const result = await appBackup().verify(selected, signal)
                      setMessage(
                        'Saved backup verified: ' +
                          result.records +
                          ' records, ' +
                          result.parts.length +
                          ' parts. Keep these files outside browser storage.' +
                          (result.verificationRecorded
                            ? ''
                            : ' The local verification timestamp could not be saved.')
                      )
                    }
                  }, 'Verifying saved files')
              }}
            />
          </label>
          <p className={styles.verificationNote}>
            {lastVerified
              ? 'Last checked: ' +
                lastVerified +
                '. Files are not monitored after this check.'
              : 'No saved copies checked on this device yet.'}
          </p>
        </div>
      </div>
      <details className="my-4">
        <summary className="font-bold cursor-pointer">
          Advanced backup options
        </summary>
        <div className="text-sm my-3 flex flex-wrap gap-3">
          <label>
            Maximum part size{' '}
            <select
              aria-label="Maximum backup part size"
              disabled={disabled}
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
              disabled={disabled}
              checked={keys}
              onChange={(e) => setKeys(e.target.checked)}
            />{' '}
            Include API keys in new backup
          </label>
        </div>
        <p className="text-xs my-3">
          Storage:{' '}
          {capacity.usage === undefined
            ? 'estimate unavailable'
            : size(capacity.usage) +
              ' used / ' +
              size(capacity.quota || 0) +
              ' estimated quota'}
          .{' '}
          {capacity.persisted
            ? 'Persistent storage granted.'
            : 'Browser storage can be evicted; keep a copy outside this browser.'}
        </p>
        {!capacity.persisted && (
          <Button
            disabled={disabled}
            onClick={() =>
              void run(
                async () =>
                  setMessage(
                    (await requestPersistence())
                      ? 'Persistent storage granted.'
                      : 'Persistence was not granted. Saved files outside this browser remain essential.'
                  ),
                'Requesting persistent storage'
              )
            }
          >
            Request persistent storage
          </Button>
        )}
        {jobs.length > 0 && (
          <details className="my-3">
            <summary>Manage local preparations ({jobs.length})</summary>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="my-3 text-sm flex flex-wrap gap-2 items-center"
              >
                <span>
                  {new Date(job.createdAt).toLocaleString()} · {job.records}{' '}
                  records · {job.status} · {size(job.bytes || 0)} prepared
                </span>
                {job.status === 'complete' && (
                  <Button
                    disabled={disabled}
                    onClick={() =>
                      void run(async () => {
                        await showPreparation(job.id)
                        setMessage(
                          'Save all listed files, then verify the saved copies.'
                        )
                      }, 'Opening saved preparation')
                    }
                  >
                    Show files
                  </Button>
                )}
                <Button
                  disabled={disabled}
                  onClick={() =>
                    void run(async () => {
                      await appBackup().discardPreparation(job.id)
                      if (activePreparation.current === job.id) {
                        activePreparation.current = null
                        setInventory(null)
                        setReady(null)
                      }
                      setMessage(
                        'Local preparation removed. Saved files and the image library are unchanged.'
                      )
                    }, 'Removing local preparation')
                  }
                >
                  Remove preparation
                </Button>
              </div>
            ))}
          </details>
        )}
        <details className="my-3">
          <summary>Legacy compatibility JSON export</summary>
          <p className="text-sm my-2">
            For older ArtBot versions. Includes database records but not
            preferences. Creates one large file and may exceed mobile memory
            limits. Use the multipart backup above for large libraries.
          </p>
          <Button
            disabled={disabled}
            onClick={() =>
              void run(async () => {
                const file = await appBackup().exportCompatibility((p) =>
                  setMessage(
                    'Exporting ' +
                      p.completedRows +
                      ' / ' +
                      p.totalRows +
                      ' rows'
                  )
                )
                downloadBlob(file, 'artbot-db_' + Date.now() + '.json')
                setMessage(
                  'Compatibility JSON download requested. Verify the saved file by restoring it into a separate test library.'
                )
              }, 'Exporting compatibility JSON')
            }
          >
            Download database
          </Button>
        </details>
      </details>
    </Section>
  )
}
