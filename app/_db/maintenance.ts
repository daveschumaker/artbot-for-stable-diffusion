import type { BackupManager } from 'app/_backup/manager'
import { records, request } from 'app/_backup/native'
export interface MaintenanceProgress {
  total: number
  current: number
  created: number
  skipped: number
  state: string
}
export async function rebuildThumbnails(
  manager: BackupManager,
  {
    signal,
    onProgress = () => {},
    convert
  }: {
    signal?: AbortSignal
    onProgress?: (progress: MaintenanceProgress) => void
    convert?: (base64: string, jobId: string) => Promise<string | undefined>
  } = {}
) {
  const makeThumbnail =
    convert || (await import('app/_utils/imageUtils')).generateBase64Thumbnail
  return manager.maintainLibrary(
    'Generating thumbnails',
    async (database, checkpoint) => {
      const progress = {
        total: await request(
          database.transaction('completed').objectStore('completed').count()
        ),
        current: 0,
        created: 0,
        skipped: 0,
        state: 'Processing'
      }
      onProgress({ ...progress })
      for await (const row of records(database, 'completed')) {
        await checkpoint()
        if (!row.value.thumbnail) {
          if (
            typeof row.value.base64String !== 'string' ||
            !row.value.base64String
          )
            progress.skipped++
          else {
            let thumbnail: string | undefined
            try {
              thumbnail = await makeThumbnail(
                row.value.base64String,
                row.value.jobId
              )
            } catch {
              /* An unreadable image is counted; never replace its record. */
            }
            await checkpoint()
            if (thumbnail) {
              const transaction = database.transaction('completed', 'readwrite')
              let failure: unknown
              const done = new Promise<void>((resolve, reject) => {
                transaction.oncomplete = () => resolve()
                transaction.onabort = () =>
                  reject(
                    failure ||
                      transaction.error ||
                      new Error('Thumbnail write failed')
                  )
              })
              const store = transaction.objectStore('completed')
              let written = false
              const latest = store.get(row.key)
              latest.onsuccess = () => {
                // Preserve fields changed by an older, uncooperative tab while
                // conversion yielded; never resurrect a deleted image.
                const current = latest.result
                if (
                  current &&
                  !current.thumbnail &&
                  current.base64String === row.value.base64String
                ) {
                  const updated = { ...current, thumbnail }
                  try {
                    if (store.keyPath === null) store.put(updated, row.key)
                    else store.put(updated)
                    written = true
                  } catch (error) {
                    failure = error
                    transaction.abort()
                  }
                }
              }
              await done
              if (written) progress.created++
              else progress.skipped++
            } else progress.skipped++
          }
        }
        progress.current++
        onProgress({ ...progress })
      }
      return progress
    },
    signal
  )
}
export function clearPendingItems(
  manager: BackupManager,
  expected: number,
  signal?: AbortSignal
) {
  return manager.maintainLibrary(
    'Clearing pending items',
    async (database, checkpoint) => {
      await checkpoint()
      const transaction = database.transaction('pending', 'readwrite')
      let changed = false
      let failure: unknown
      const done = new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onabort = () =>
          reject(
            changed
              ? new Error(
                  'The pending queue changed. Review its current count and confirm again.'
                )
              : failure ||
                  transaction.error ||
                  new Error('Pending queue could not be cleared')
          )
      })
      const store = transaction.objectStore('pending')
      const count = store.count()
      count.onsuccess = () => {
        if (count.result !== expected) {
          changed = true
          transaction.abort()
        } else {
          try {
            store.clear()
          } catch (error) {
            failure = error
            transaction.abort()
          }
        }
      }
      await done
      return expected
    },
    signal
  )
}
