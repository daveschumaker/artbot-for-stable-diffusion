import memoize from 'memoizee'
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

// Compatibility entry points share the staged recovery engine with Settings.
export const dbImport = async (blob: Blob) => {
  const { appBackup } = await import('app/_backup')
  const report = await appBackup().restore([blob])
  db.close()
  return report
}

export const dbExport = async (
  onProgress?: (progress: ExportProgress) => void
) => {
  const { appBackup } = await import('app/_backup')
  return appBackup().exportCompatibility(onProgress)
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

export const updateCompletedJob = async (
  tableId: number,
  updatedObject: object
) => {
  db.completed.update(tableId, updatedObject)
}

// A claim older than this belongs to a tab that was reloaded or closed while
// sending the request. Live requests finish well within it.
const STALE_CLAIM_MS = 2 * 60 * 1000

/**
 * Marks jobs left "Requested" by a reload or closed tab as failed. Nothing will
 * send or poll them again. Resending could charge the user twice if the Horde
 * did get the request, so the user decides whether to retry. Rows from older
 * versions have no claim time and count as stale.
 */
export const failStaleRequestedJobs = async (
  isSubmitting: (id: number) => boolean = () => false
) => {
  const cutoff = Date.now() - STALE_CLAIM_MS
  return db.transaction('rw', db.pending, async () => {
    const stale = await db.pending
      .where('jobStatus')
      .equals(JobStatus.Requested)
      .filter(
        (job: any) => (job.requestedAt ?? 0) < cutoff && !isSubmitting(job.id)
      )
      .toArray()
    for (const job of stale) {
      await db.pending.update(job.id, {
        jobStatus: JobStatus.Error,
        errorMessage:
          "ArtBot couldn't confirm this request reached the AI Horde. If the image doesn't appear in your library, retry it."
      })
    }
    return stale.length
  })
}

/** One pending row by table id. Unlike allPendingJobs, errors aren't hidden. */
export const getPendingJobById = (id: number) => db.pending.get(id)

export const claimPendingJobForSubmission = async (id: number, jobId: string) =>
  db.transaction('rw', db.pending, async () => {
    const current = await db.pending.get(id)
    if (
      !current ||
      current.jobId !== jobId ||
      current.jobStatus !== JobStatus.Waiting
    ) {
      return null
    }
    const claimed = {
      ...current,
      jobStatus: JobStatus.Requested,
      // When this tab took it. See failStaleRequestedJobs.
      requestedAt: Date.now()
    }
    await db.pending.put(claimed)
    return claimed
  })

export const addCompletedJobToDexie = async (imageDetails = {}) => {
  try {
    await db.transaction('rw', db.completed, async () => {
      const jobId = (imageDetails as { jobId?: string }).jobId
      if (jobId && (await db.completed.where('jobId').equals(jobId).first())) {
        return
      }
      await db.completed.put(Object.assign({}, imageDetails))
    })
  } catch (err: any) {
    console.log(`Uh oh! An error occurred!`)
    console.log(err.message)

    if (err.name === 'QuotaExceededError') {
      setStorageQuotaLimit(true)
    }
    throw err
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
