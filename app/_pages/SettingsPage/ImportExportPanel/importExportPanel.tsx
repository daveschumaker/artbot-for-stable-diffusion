'use client'
import { useState } from 'react'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { countCompletedJobs } from 'app/_utils/db'
import { downloadImages } from 'app/_utils/imageUtils'
import PageTitle from 'app/_components/PageTitle'
import { Button } from 'app/_components/Button'
import ExportDatabase from '../ExportDatabase'
import ImportDatabase from '../ImportDatabase'
import { BackupOperations, useBackupOperation } from '../BackupOperations'
import DevExportImport from '../_DevExportImport'

function ImageDownloads() {
  const operation = useBackupOperation()
  const [total, setTotal] = useState(0)
  const [perZip, setPerZip] = useState(25)
  const [status, setStatus] = useState('')
  const [completed, setCompleted] = useState<number[]>([])
  useEffectOnce(() => {
    void countCompletedJobs()
      .then(setTotal)
      .catch(() => {})
  })
  const download = async (offset: number, limit: number) => {
    const release = operation.begin('Building image ZIP')
    if (!release) return
    setStatus('Preparing image ZIP…')
    let failed = false
    try {
      await downloadImages({
        offset,
        limit,
        sort: 'old',
        callback: ({ currentIndex, error }: any) => {
          if (error) failed = true
          if (currentIndex !== undefined)
            setStatus(
              'Processing image ' + (currentIndex + 1) + ' of ' + total + '…'
            )
        }
      })
      if (failed)
        throw new Error('No image files could be included in this ZIP.')
      setCompleted((old) => [...new Set([...old, offset])])
      setStatus(
        'Image ZIP download requested. Keep a complete backup as well if you need to restore ArtBot.'
      )
    } catch (error) {
      setStatus('Unable to download this ZIP. ' + (error as Error).message)
    } finally {
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
              {completed.includes(offset) && (
                <span className="text-xs">Download requested</span>
              )}
            </li>
          )
        })}
      </ul>
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
