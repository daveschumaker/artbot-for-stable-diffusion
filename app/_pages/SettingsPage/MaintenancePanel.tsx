'use client'
import { useEffect, useRef, useState } from 'react'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import { Button } from 'app/_components/Button'
import { appBackup, withScreenAwake } from 'app/_backup'
import { libraryStorage } from 'app/_backup/platform'
import { db } from 'app/_db/dexie'
import { deletePendingJobs } from 'app/_controllers/pendingJobsCache'
import { useBackupOperation } from './BackupOperations'
import { useSettings } from './SettingsContext'
import { SETTINGS_DEFAULTS } from 'app/_data-models/settingsSchema'
import { rebuildThumbnails, clearPendingItems } from 'app/_db/maintenance'
export default function MaintenancePanel() {
  const operation = useBackupOperation()
  const { values, saveMany } = useSettings()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<number | null>(null)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => {
    void db.pending
      .count()
      .then(setPending)
      .catch(() => setPending(null))
    return () => abort.current?.abort()
  }, [])
  const run = async (
    label: string,
    action: (signal: AbortSignal) => Promise<void>
  ) => {
    const release = operation.begin(label)
    if (!release) return
    const controller = new AbortController()
    abort.current = controller
    const hidden = () => {
      if (document.hidden) controller.abort()
    }
    document.addEventListener('visibilitychange', hidden)
    setMessage('')
    try {
      await withScreenAwake(() => action(controller.signal))
    } catch (error) {
      setMessage(
        (error as Error).name === 'AbortError'
          ? 'Paused. Completed thumbnails are kept. Run again to continue.'
          : 'Maintenance could not finish. ' + (error as Error).message
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      abort.current = null
      await db.pending
        .count()
        .then(setPending)
        .catch(() => setPending(null))
      release()
    }
  }
  return (
    <>
      <PageTitle as="h2">Troubleshooting & maintenance</PageTitle>
      <p className="text-sm my-3">
        Use these tools when you need to repair display data or reset
        preferences. Keep ArtBot visible during long operations.
      </p>
      <p role="status" aria-label="Maintenance status" className="text-sm my-3">
        {message}
      </p>
      {operation.active && abort.current && (
        <Button onClick={() => abort.current?.abort()}>
          Pause maintenance
        </Button>
      )}
      <Section>
        <h3 className="font-bold">Generate missing thumbnails</h3>
        <p className="text-sm my-3">
          Processes one image at a time. Existing thumbnails are kept;
          restarting skips completed work.
        </p>
        <Button
          disabled={!!operation.active}
          onClick={() =>
            void run('Generating thumbnails', async (signal) => {
              const result = await rebuildThumbnails(appBackup(), {
                signal,
                onProgress: (progress) =>
                  setMessage(
                    `Processing ${progress.current} of ${progress.total}; ${progress.created} created, ${progress.skipped} skipped.`
                  )
              })
              setMessage(
                `Thumbnails complete: ${result.created} created; ${result.skipped} images skipped.`
              )
            })
          }
        >
          Generate thumbnails
        </Button>
      </Section>
      <Section>
        <h3 className="font-bold">Diagnostics</h3>
        <Button
          disabled={!!operation.active}
          onClick={() =>
            void run('Downloading debugging logs', async () => {
              if (!window.artbotDownloadLogs)
                throw new Error(
                  'Debugging logs are not available. Reopen ArtBot and try again.'
                )
              window.artbotDownloadLogs()
              setMessage('Debugging log download requested.')
            })
          }
        >
          Download debugging logs
        </Button>
      </Section>
      <Section>
        <h3 className="font-bold">Reset preferences</h3>
        <p className="text-sm my-3">
          Reset display, generation and worker preferences. Your API key, image
          library and backups are kept.
        </p>
        <Button
          disabled={!!operation.active}
          onClick={() => {
            if (
              !window.confirm(
                'Reset display, generation and worker preferences? Your API key, images and backups will be kept.'
              )
            )
              return
            if (saveMany({ ...SETTINGS_DEFAULTS, apiKey: values.apiKey }))
              setMessage(
                'Preferences reset. Your API key and image library were kept.'
              )
          }}
        >
          Reset preferences
        </Button>
      </Section>
      <Section>
        <h3 className="font-bold">Reset create input cache</h3>
        <p className="text-sm my-3">
          Forget the create page’s last input values. Prompt history, images and
          credentials are kept.
        </p>
        <Button
          disabled={!!operation.active}
          onClick={() => {
            if (
              !window.confirm(
                'Forget the create page’s saved input values? Prompt history and images will be kept.'
              )
            )
              return
            void run('Resetting input cache', async () => {
              libraryStorage.removeItem('PromptInputSettings')
              setMessage('Create input cache reset.')
            })
          }}
        >
          Reset input cache
        </Button>
      </Section>
      <Section>
        <h3 className="font-bold">Clear pending items</h3>
        <p className="text-sm my-3">
          {pending === null
            ? 'Pending count unavailable.'
            : `${pending} pending items stored locally.`}{' '}
          Removing these does not cancel requests already sent to AI Horde.
          Completed images are kept.
        </p>
        <Button
          disabled={!!operation.active || pending === null || pending === 0}
          onClick={() => {
            if (
              pending === null ||
              !window.confirm(
                `Remove ${pending} locally stored pending items? This does not cancel requests already sent to AI Horde. Completed images will be kept.`
              )
            )
              return
            void run('Clearing pending items', async (signal) => {
              const count = await clearPendingItems(
                appBackup(),
                pending,
                signal
              )
              await deletePendingJobs()
              setMessage(
                `${count} pending items removed. Completed images were kept.`
              )
            })
          }}
        >
          Clear pending items
        </Button>
      </Section>
    </>
  )
}
