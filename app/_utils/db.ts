import memoize from 'memoizee'
import Dexie from 'dexie'
import type { ExportProgress } from 'dexie-export-import/dist/export'

import { db } from 'app/_db/dexie'
import {
  setStorageQuotaLimit,
  setUnsupportedBrowser
} from 'app/_store/appStore'
import { JobStatus } from '_types'
import { generateBase64Thumbnail } from './imageUtils'
import { SourceProcessing } from './promptUtils'
import { deletePendingJobs } from 'app/_controllers/pendingJobsCache'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'

interface ThumbnailProgress {
  total: number
  current: number
  state?: string
}

// The streaming importer can stop at EOF before the root JSON object closes.
// Check framing before any writes, without reading a large backup into memory.
const assertCompleteBackup = async (blob: Blob) => {
  const reader = blob.stream().getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const incomplete = new Error('Expected a complete database export')
  let depth = 0
  let started = false
  let closed = false
  let inString = false
  let escaped = false

  try {
    while (true) {
      const { value, done } = await reader.read()
      for (const char of decoder.decode(value, { stream: !done })) {
        if (inString) {
          if (escaped) escaped = false
          else if (char === '\\') escaped = true
          else if (char === '"') inString = false
          continue
        }
        if (/\s/.test(char)) continue
        if (closed || (!started && char !== '{')) throw incomplete
        started = true
        if (char === '"') inString = true
        else if (char === '{' || char === '[') depth++
        else if (char === '}' || char === ']') {
          depth--
          closed = depth === 0 && char === '}'
        }
      }
      if (done) break
    }
    if (!closed) throw incomplete
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export const dbImport = async (blob: Blob) => {
  await assertCompleteBackup(blob)
  const { importInto } = await import('dexie-export-import')
  let cleared = false
  const clearing: Promise<unknown>[] = []
  await importInto(db, blob, {
    filter: () => {
      if (!cleared) {
        const transaction = Dexie.currentTransaction
        if (!transaction)
          throw new Error('Database import requires a transaction')
        // clearTablesBeforeImport in this library version runs before its
        // transaction. Enqueue clears from the first row callback,
        // inside that transaction and before the first insert. Streaming and
        // Blob reads remain owned by the importer; any failure rolls back both.
        for (const table of db.tables) {
          const clear = transaction.table(table.name).clear()
          clear.catch(() => transaction.abort())
          clearing.push(clear)
        }
        cleared = true
      }
      return true
    }
  })
  await Dexie.Promise.all(clearing)
  // A valid empty backup never invokes the row callback. Validate it through
  // the importer first, then replace the current data with one atomic clear.
  if (!cleared)
    await db.transaction('rw', db.tables, () =>
      Dexie.Promise.all(db.tables.map((table) => table.clear()))
    )
  return true
}

export const dbExport = async (
  onProgress?: (progress: ExportProgress) => void
) => {
  const { exportDB } = await import('dexie-export-import')
  // Dexie's type wants a boolean, but it ignores the return value.
  const progressCallback = onProgress
    ? (progress: ExportProgress) => {
        onProgress(progress)
        return false
      }
    : undefined
  const blob = await exportDB(db, { prettyJson: true, progressCallback })
  return blob
}

export const addImageToDexie = async ({
  base64String,
  hordeImageId = '',
  jobId,
  type,
  force
}: {
  base64String: string
  hordeImageId: string
  jobId: string
  type?: string
  force?: boolean
}) => {
  if (force) {
    await db.images.put({
      jobId,
      base64String,
      hordeImageId,
      type,
      timestamp: Date.now()
    })
  } else {
    await db.images.add({
      jobId,
      base64String,
      hordeImageId,
      type,
      timestamp: Date.now()
    })
  }
}

export const deleteImageFromDexie = async (jobId: string) => {
  await db.images.where('jobId').equals(jobId).delete()
}

export const getJobImagesFromDexie = async (jobId: string) => {
  return await db.images.where('jobId').equals(jobId).toArray()
}

export const generateThumbnails = async (
  cb: (progress: ThumbnailProgress) => void = () => {}
) => {
  let total = await countCompletedJobs()
  let current = 0

  cb({
    total,
    current
  })

  let imageIds: Array<number> = []

  await db.completed.each((record: any) => {
    current++

    if (!record.thumbnail) {
      imageIds.push(record.id)
    }

    cb({
      total,
      current,
      state: 'Analyzing'
    })
  })

  current = 0
  total = imageIds.length
  for (const id in imageIds) {
    current++
    cb({
      total,
      current,
      state: 'Processing'
    })
    const record = await db.completed.where('id').equals(imageIds[id]).first()

    if (record.thumbnail) {
      continue
    } else {
      const thumbnail = await generateBase64Thumbnail(
        record.base64String,
        record.jobId
      )

      console.log(`Updating thumbnail for image id: ${record.id}`)
      await db.completed.where('id').equals(imageIds[id]).modify({ thumbnail })
    }
  }
}

export const setDefaultPrompt = async (prompt: string) => {
  const result = (await getDefaultPrompt()) || []
  const [defaultPrompt] = result

  if (!defaultPrompt || !defaultPrompt.timestamp) {
    await db.prompts.add({
      prompt,
      promptType: 'default',
      timestamp: Date.now()
    })
  } else if (defaultPrompt.id) {
    await db.prompts.update(defaultPrompt.id, {
      prompt,
      promptType: 'default',
      timestamp: Date.now()
    })
  }

  return defaultPrompt
}

export const getDefaultPrompt = async () => {
  try {
    return (
      (await db?.prompts
        ?.where({ promptType: 'default' })
        .limit(1)
        ?.toArray()) || []
    )
  } catch (err: any) {
    if (
      err.message.indexOf(
        'A mutation operation was attempted on a database that did not allow mutations'
      ) >= 0
    ) {
      setUnsupportedBrowser(true)
    }
    return []
  }
}

export const getPrompts = async (promptType: string, promptType2?: string) => {
  return (
    (await db?.prompts
      ?.orderBy('id')
      ?.filter(function (prompt: { promptType: string }) {
        if (promptType2 && prompt.promptType === promptType2) {
          return true
        }

        return prompt.promptType === promptType
      })
      ?.reverse()
      ?.toArray()) || []
  )
}

// Fix interesting race condition where pending jobs appear in "all" jobs,
// but no actual items are visible.
export const deleteStalePending = async () => {
  return await db?.pending
    ?.filter(function (job: { jobStatus: string }) {
      return !job.jobStatus
    })
    ?.delete()
}

export const clearPendingJobsTable = async () => {
  return await db.pending.clear()
}

export const allPendingJobs = async (status?: string) => {
  try {
    if (status) {
      return await db?.pending?.where('jobStatus')?.equals(status)?.sortBy('id')
    } else {
      return await db?.pending?.orderBy('id')?.toArray()
    }
  } catch (err: any) {
    if (
      err.message.indexOf(
        'A mutation operation was attempted on a database that did not allow mutations'
      ) >= 0
    ) {
      setUnsupportedBrowser(true)
    }
    return []
  }
}

// Useful for fetching date user first used site.
export const fetchFirstCompletedJob = async () => {
  return await db?.completed?.orderBy('id')?.limit(1).first()
}

export const _allCompletedJobs = async () => {
  return await db?.completed?.orderBy('id')?.toArray()
}

export const allCompletedJobs = memoize(_allCompletedJobs, {
  maxAge: 10000
})

export const deleteDoneFromPending = async () => {
  const pendingJobs = (await allPendingJobs()) || []
  const done = pendingJobs.filter((job: { jobStatus: JobStatus }) => {
    return job.jobStatus === JobStatus.Done
  })

  const ids = done.map((job: any) => job.id)
  await db.pending.bulkDelete(ids)
}

export const deleteQueuedFromPending = async () => {
  const pendingJobs = (await allPendingJobs()) || []
  const done = pendingJobs.filter((job: { jobStatus: JobStatus }) => {
    return job.jobStatus === JobStatus.Queued
  })

  const ids = done.map((job: any) => job.id)
  await db.pending.bulkDelete(ids)
}

export const deleteRequestedFromPending = async () => {
  const pendingJobs = (await allPendingJobs()) || []
  const done = pendingJobs.filter((job: { jobStatus: JobStatus }) => {
    return job.jobStatus === JobStatus.Requested
  })

  const ids = done.map((job: any) => job.id)
  await db.pending.bulkDelete(ids)
}

export const deleteInvalidPendingJobs = async () => {
  const pendingJobs = (await allPendingJobs()) || []
  const done = pendingJobs.filter((job: { jobStatus: JobStatus }) => {
    return typeof job.jobStatus === 'undefined' || !job.jobStatus
  })

  const ids = done.map((job: any) => job.id)
  await db.pending.bulkDelete(ids)
}

export const bulkDeleteImages = async (images: Array<string>) => {
  return db.completed.bulkDelete(images)
}

export const countCompletedJobs = async () => {
  return await db?.completed?.orderBy('timestamp').count()
}

const isText2Img = (entry: any) =>
  !entry.img2img &&
  (!entry.source_processing ||
    entry.source_processing === SourceProcessing.Prompt)

export const countFilterCompleted = async ({
  filterType = 'favorited',
  model = ''
} = {}) => {
  const filterFunc = (entry: any) => {
    if (filterType === 'model') {
      if (entry?.models && entry?.models?.indexOf(model) >= 0) {
        return true
      }

      if (entry?.model && entry?.model?.indexOf(model) >= 0) {
        return true
      }

      return false
    }

    if (filterType === 'favorited') {
      return entry.favorited === true
    }

    if (filterType === 'unfavorited') {
      return entry.favorited !== true
    }

    if (filterType === 'text2img') {
      return isText2Img(entry)
    }

    if (filterType === 'img2img') {
      return (
        entry.img2img || entry.source_processing === SourceProcessing.Img2Img
      )
    }

    if (filterType === 'inpainting') {
      return entry.source_processing === SourceProcessing.InPainting
    }

    return true
  }

  return await db?.completed
    ?.orderBy('timestamp')
    .filter(function (entry: any) {
      return filterFunc(entry)
    })
    .count()
}

export const filterCompletedByModel = async (model: string) => {
  return await db?.completed
    ?.orderBy('timestamp')
    .filter(function (entry: any) {
      if (entry?.models && entry?.models?.indexOf(model) >= 0) {
        return true
      }

      if (entry?.model && entry?.model?.indexOf(model) >= 0) {
        return true
      }

      return false
    })
    .count()
}

export const filterCompletedJobs = async ({
  limit = 100,
  offset = 0,
  sort = 'new',
  filterType = 'favorited',
  model = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  callback = (index: any) => {}
} = {}) => {
  let imageIndex = 1

  const filterFunc = (entry: any) => {
    callback(imageIndex)
    imageIndex++

    if (filterType === 'model') {
      if (entry.models && entry?.models?.indexOf(model) >= 0) {
        return true
      }

      if (entry.model && entry?.model?.indexOf(model) >= 0) {
        return true
      }

      return false
    }

    if (filterType === 'favorited') {
      return entry.favorited === true
    }

    if (filterType === 'unfavorited') {
      return entry.favorited !== true
    }

    if (filterType === 'text2img') {
      return isText2Img(entry)
    }

    if (filterType === 'img2img') {
      return (
        entry.img2img || entry.source_processing === SourceProcessing.Img2Img
      )
    }

    if (filterType === 'inpainting') {
      return (
        entry.source_processing === SourceProcessing.InPainting ||
        entry.source_mask
      )
    }

    if (filterType === 'upscaled') {
      return entry.upscaled === true
    }

    return true
  }

  if (sort === 'old') {
    return await db?.completed
      ?.orderBy('timestamp')
      .filter(function (entry: any) {
        return filterFunc(entry)
      })
      .offset(offset)
      .limit(limit)
      .toArray()
  } else {
    return await db?.completed
      ?.orderBy('timestamp')
      .filter(function (entry: any) {
        return filterFunc(entry)
      })
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray()
  }
}

export const fetchCompletedJobs = async ({
  limit = 100,
  offset = 0,
  sort = 'new'
} = {}) => {
  if (sort === 'old') {
    return await db?.completed
      ?.orderBy('timestamp')
      .offset(offset)
      .limit(limit)
      .toArray()
  } else {
    return await db?.completed
      ?.orderBy('timestamp')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray()
  }
}

export const fetchCompletedJobsById = async (ids = []) => {
  return await db?.completed
    .where('jobId')
    .anyOf([...ids])
    .toArray()
}

export const fetchRelatedImages = async (
  parentJobId: string,
  limit: number = 100,
  sort?: string
) => {
  if (!limit) {
    limit = Infinity
  }

  if (sort === 'normal') {
    return await db?.completed?.where({ parentJobId }).limit(limit).toArray()
  } else {
    return await db?.completed
      ?.where({ parentJobId })
      .limit(limit)
      .reverse()
      .toArray()
  }
}

export const getParentJobDetails = async (jobId: string) => {
  const results: CreateImageRequest[] =
    (await fetchRelatedImages(jobId, 1, 'normal')) || []
  const details: CreateImageRequest = results[0] || {}
  return details
}

export const getPendingJobDetails = async (jobId: string) => {
  return await db.pending.where('jobId').equals(jobId).first()
}

export const updatePendingJobInDexieByJobId = async (
  jobId: string,
  updatedObject: any
) => {
  const pendingJob = await getPendingJobDetails(jobId)
  const updated = Object.assign({}, pendingJob, updatedObject)

  if (jobId) {
    db.pending.update(pendingJob.id, updated)
  }
}

export const updateCompletedJob = async (
  tableId: number,
  updatedObject: object
) => {
  db.completed.update(tableId, updatedObject)
}

export const addCompletedJobToDexie = async (imageDetails = {}) => {
  try {
    await db.completed.put(Object.assign({}, imageDetails))
  } catch (err: any) {
    console.log(`Uh oh! An error occurred!`)
    console.log(err.message)

    if (err.message.includes('QuotaExceededError')) {
      setStorageQuotaLimit(true)
    }
  }
}

export const addPendingJobToDexie = async (jobDetails: CreateImageRequest) => {
  const jobExists = await getPendingJobDetails(jobDetails.jobId)

  if (!jobExists) {
    // Let Dexie assign a new auto-increment id.
    delete (jobDetails as { id?: number }).id

    const info = await db.pending.add(jobDetails)
    return info
  } else {
    const info = await db.pending.put({ ...jobDetails })
    return info
  }
}

export const updatePendingJobInDexie = async (
  tableId: number,
  updatedObject: any
) => {
  db.pending.update(tableId, updatedObject)
}

export const updateAllPendingJobs = async (
  parentJobId: string,
  updateFields: any
) => {
  await db.pending
    .filter((job: { parentJobId: string; jobStatus: string }) => {
      return (
        job.parentJobId === parentJobId && job.jobStatus === JobStatus.Waiting
      )
    })
    .modify((job: any) => {
      for (const [key, value] of Object.entries(updateFields)) {
        job[key] = value
      }
    })
}

export const updateCompletedJobByJobId = async (
  jobId: string = '',
  updateFields: any
) => {
  if (!jobId) return

  await db.completed
    .where('jobId')
    .equals(jobId)
    .modify((job: any) => {
      for (const [key, value] of Object.entries(updateFields)) {
        job[key] = value
      }
    })
}

export const deleteAllPendingErrors = async () => {
  await db.pending
    .filter(function (job: { jobStatus: string }) {
      if (job.jobStatus === JobStatus.Error) {
        console.log(`Found jobs with error, deleting`)
        return true
      }
    })
    .delete()

  deletePendingJobs(JobStatus.Error)
}

export const deleteAllPendingJobs = async () => {
  await db.pending
    .filter(function (job: { jobStatus: string }) {
      return (
        job.jobStatus === JobStatus.Queued ||
        job.jobStatus === JobStatus.Waiting
      )
    })
    .delete()

  deletePendingJobs(JobStatus.Queued)
  deletePendingJobs(JobStatus.Waiting)
}

export const getImageDetailsById = async (id: number) => {
  return await db.completed.where('id').equals(id).first()
}

export const _getImageDetails = async (jobId: string) => {
  return await db.completed.where('jobId').equals(jobId).first()
}

export const getImageDetails = memoize(_getImageDetails, {
  maxAge: 1000
})

export const getNextImageDetails = async (timestamp: number) => {
  return await db.completed.where('timestamp').above(timestamp).limit(1).first()
}

export const getPrevImageDetails = async (timestamp: number) => {
  return await db.completed
    .where('timestamp')
    .below(timestamp)
    .reverse()
    .limit(1)
    .first()
}

export const deleteCompletedImage = async (jobId: string) => {
  await db.completed.where('jobId').equals(jobId).delete()
}

export const deleteCompletedImageById = async (id: number) => {
  await db.completed.where('id').equals(id).delete()
}

export const deletePendingJobFromDb = async (jobId: string) => {
  await db.pending.where('jobId').equals(jobId).delete()
}

export const imageCount = async () => {
  return await db.completed.count()
}

export const pendingCount = async () => {
  return await db.pending.count()
}

export const initDb = () => {
  // This does nothing other than to ensure this module is loaded and ready.
  // console.log(`Database loaded`)
}

declare const window: any
if (typeof window !== 'undefined') {
  window._artbotDb = db
  window._artbotDb.getImageDetails = getImageDetails
  window._artbotDb.imageCount = imageCount
}
