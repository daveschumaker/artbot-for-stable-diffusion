'use client'
import { useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { countCompletedJobs } from 'app/_utils/db'
import { downloadImages } from 'app/_utils/imageUtils'
import PageTitle from 'app/_components/PageTitle'
import { Button } from 'app/_components/Button'
import ExportDatabase from '../ExportDatabase'
import ImportDatabase from '../ImportDatabase'
import { BackupOperations, useBackupOperation } from '../BackupOperations'
import DevExportImport from '../_DevExportImport'
import { withScreenAwake } from 'app/_backup'

function ImageDownloads() {
  const operation = useBackupOperation()
  const [total, setTotal] = useState(0)
  const [perZip, setPerZip] = useState(25)
  const [status, setStatus] = useState('')
  const [completed, setCompleted] = useState<number[]>([])
  const [working, setWorking] = useState(false)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])
  useEffectOnce(() => {
    void countCompletedJobs()
      .then(setTotal)
      .catch(() => {})
  })
  const download = async (offset: number, limit: number, direct = false) => {
    const release = operation.begin('Building image ZIP')
    if (!release) return
    setStatus('Preparing image ZIP…')
    const controller = new AbortController()
    abort.current = controller
    setWorking(true)
    const hidden = () => {
      if (document.hidden) controller.abort()
    }
    let writable: WritableStream<Uint8Array> | undefined
    try {
      // Invoke the native picker from the click, before any image reads/imports.
      const handle = direct
        ? await (window as any).showSaveFilePicker({
            suggestedName: `artbot-images-${offset + 1}-${offset + limit}.zip`,
            types: [
              {
                description: 'Image ZIP',
                accept: { 'application/zip': ['.zip'] }
              }
            ]
          })
        : undefined
      writable = handle ? await handle.createWritable() : undefined
      document.addEventListener('visibilitychange', hidden)
      const result = await withScreenAwake(() =>
        downloadImages({
          offset,
          limit,
          sort: 'old',
          signal: controller.signal,
          writable,
          callback: ({ currentIndex }: any) => {
            if (currentIndex !== undefined)
              setStatus(
                'Processing image ' + (currentIndex + 1) + ' of ' + total + '…'
              )
          }
        })
      )
      setCompleted((old) => [...new Set([...old, offset])])
      setStatus(
        `${direct ? 'Image ZIP saved.' : 'Image ZIP download requested.'} ${
          result.included
        } images included; ${
          result.skipped
        } skipped. Keep a complete backup as well if you need to restore ArtBot.`
      )
    } catch (error) {
      await writable?.abort().catch(() => {})
      setStatus(
        (error as Error).name === 'AbortError'
          ? 'Image ZIP cancelled. Retry this ZIP when ArtBot is visible.'
          : 'Unable to download this ZIP. ' + (error as Error).message
      )
    } finally {
      document.removeEventListener('visibilitychange', hidden)
      abort.current = null
      setWorking(false)
      release()
    }
  }
  return (
    <details
      id="download-images"
      className="scroll-mt-24 rounded-lg border border-gray-300 dark:border-gray-700 p-4"
    >
      <summary className="font-bold cursor-pointer">Download images</summary>
      <p className="text-sm my-3">
        {total} images. ZIP archives contain generated images and generation
        parameters for viewing or sharing. They do not replace the complete
        library backup above.
      </p>
      <p className="text-sm my-3">
        Smaller ZIPs use less working memory. Start with a smaller batch on an
        iPhone.
      </p>
      <label className="text-sm">
        Images per ZIP{' '}
        <select
          aria-label="Images per ZIP"
          value={perZip}
          disabled={!!operation.active}
          onChange={(event) => {
            setPerZip(Number(event.target.value))
            setCompleted([])
          }}
        >
          {[25, 50, 100, 250, 500, 750].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <ul className="my-3 space-y-2">
        {Array.from({ length: Math.ceil(total / perZip) }, (_, index) => {
          const offset = index * perZip
          const limit = Math.min(perZip, total - offset)
          return (
            <li key={offset} className="flex gap-2 items-center">
              <Button
                disabled={!!operation.active}
                onClick={() => void download(offset, limit)}
              >
                Download images ({offset + 1} - {offset + limit})
              </Button>
              {typeof window !== 'undefined' &&
                'showSaveFilePicker' in window && (
                  <Button
                    disabled={!!operation.active}
                    onClick={() => void download(offset, limit, true)}
                  >
                    Save ZIP directly ({offset + 1} - {offset + limit})
                  </Button>
                )}
              {completed.includes(offset) && (
                <span className="text-xs">Download requested</span>
              )}
            </li>
          )
        })}
      </ul>
      {working && (
        <Button onClick={() => abort.current?.abort()}>Cancel image ZIP</Button>
      )}
      <p role="status" aria-label="Image download status" className="text-sm">
        {status}
      </p>
    </details>
  )
}
export default function ImportExportPanel() {
  return (
    <BackupOperations>
      <div className="space-y-8 pb-24">
        <PageTitle as="h2">Import / Export Data</PageTitle>
        <nav
          aria-label="Backup and restore sections"
          className="flex flex-wrap gap-4 text-sm font-bold text-teal-600 dark:text-teal-400"
        >
          <a href="#backup-library">Back up</a>
          <a href="#restore-library">Restore</a>
          <a href="#download-images">Image ZIPs</a>
        </nav>
        <ExportDatabase />
        <ImportDatabase />
        <ImageDownloads />
        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' && (
          <details>
            <summary>Developer tools</summary>
            <DevExportImport />
          </details>
        )}
      </div>
    </BackupOperations>
  )
}
