import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import { db } from './dexie'
import { JobStatus } from '_types/artbot'

export const addPendingJobToDexieV2 = async (
  jobDetails: CreateImageRequestV2
) => {
  delete jobDetails.id

  db.transaction('rw', db.image_details, db.image_status, async () => {
    // TODO: Handle source image and source mask.

    await db.image_details.add({ ...jobDetails })
    await db.image_status.add({
      jobId: jobDetails.jobId,
      status: JobStatus.Waiting
    })
  }).catch((err) => {
    console.log(`Error: Unable to add request to browser database.`)
    console.error(err.stack || err)
  })

  const info = await db.pending.add(jobDetails)
  return info
}

export const fetchImageDetails = async (status: JobStatus) => {
  try {
    const waitingDetails: CreateImageRequestV2[] = []

    // Start a transaction for reading from both tables
    await db
      .transaction('r', db.image_status, db.image_details, async () => {
        const waitingStatuses = await db.image_status
          .where({ status })
          .toArray()

        // For each 'Waiting' status, find the corresponding image details
        for (const status of waitingStatuses) {
          const details = await db.image_details.get({ jobId: status.jobId })
          if (details) {
            waitingDetails.push({ ...details, ...status })
          }
        }
      })
      .catch((err) => {
        console.error(err.stack || err)
      })

    return waitingDetails
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to fetch waiting image details:', err.stack)
    } else {
      console.error('An unexpected error occurred:', err)
    }

    return []
  }
}

export const updateImageStatus = async ({
  jobId,
  status,
  updateJobId,
  init_wait_time,
  wait_time,
  queue_position
}: {
  jobId: string
  status: JobStatus
  updateJobId?: string
  init_wait_time?: number
  wait_time?: number
  queue_position?: number
}) => {
  const updateFields = {
    jobId: updateJobId || jobId,
    status
  }

  if (typeof init_wait_time !== 'undefined' && init_wait_time >= 0) {
    updateFields.init_wait_time = init_wait_time
  }

  if (typeof wait_time !== 'undefined' && wait_time >= 0) {
    updateFields.wait_time = wait_time
  }

  if (typeof queue_position !== 'undefined' && queue_position >= 0) {
    updateFields.queue_position = queue_position
  }

  await db
    .transaction('rw', db.image_details, db.image_status, async () => {
      await db.image_details
        .where({ jobId })
        .modify({ jobId: updateJobId || jobId })
      await db.image_status.where({ jobId }).modify({ ...updateFields })
    })
    .catch((err) => {
      console.error(err.stack || err)
    })
}
