import { checkImageStatus } from '../api/checkImageStatus'
import { getFinishedImage } from '../api/getFinishedImage'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { CreateImageJob } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJobFromDb,
  getPendingJobDetails,
  pendingCount,
  updatePendingJob
} from './db'
import { createNewImage, orientationDetails, randomSampler } from './imageUtils'

export const initIndexedDb = () => {}

const multiImageQueue: Array<CreateImageJob> = []
const jobDetailsQueue: Array<string> = []

interface CheckImage {
  success: boolean
  status?: string
  jobId?: string
  done?: boolean
  queue_position?: number
  wait_time?: number
}

interface FinishedImage {
  success: boolean
  base64String?: string
}

let pendingCheckRequest = false
export const checkImageJob = async (jobId: string): Promise<CheckImage> => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid jobId'
    }
  }

  if (pendingCheckRequest) {
    return {
      success: false,
      status: 'Waiting for pending request...'
    }
  }

  pendingCheckRequest = true

  try {
    const data: CheckImage = await checkImageStatus(jobId)
    console.log(`IMG STATUS`, data)

    const { success, status = '' } = data
    pendingCheckRequest = false

    if (status === 'NOT_FOUND') {
      await deletePendingJobFromDb(jobId)
      return {
        success: false,
        status: 'NOT_FOUND'
      }
    } else if (!success) {
      return {
        success: false,
        status
      }
    }

    return {
      jobId,
      ...data
    }
  } catch (err) {
    pendingCheckRequest = false
    return {
      success: false,
      status: 'SOME_ERROR'
    }
  }
}

export const fetchJobDetails = async () => {
  const [currentJobId] = jobDetailsQueue

  if (currentJobId) {
    const pendingJobDetails = await getPendingJobDetails(currentJobId)

    if (!pendingJobDetails) {
      jobDetailsQueue.shift()
      return
    }

    const { id: tableId } = pendingJobDetails

    const jobDetailsFromApi = await checkImageJob(currentJobId)
    const { success, queue_position, wait_time, status } = jobDetailsFromApi

    if (status === 'NOT_FOUND') {
      jobDetailsQueue.shift()
      return
    }

    if (!success) {
      const jobTimestamp = pendingJobDetails.timestamp / 1000
      const timestamp = Date.now() / 1000

      // Check if job is stale and remove it.
      if (timestamp - jobTimestamp > 720) {
        deletePendingJobFromDb(currentJobId)
        jobDetailsQueue.shift()
      }
    }

    if (success) {
      await updatePendingJob(
        tableId,
        Object.assign({}, pendingJobDetails, {
          queue_position,
          wait_time
        })
      )

      jobDetailsQueue.shift()
    }
  }
}

let waitingForRes = false
export const createMultiImageJob = async () => {
  if (waitingForRes) {
    return
  }

  const [nextJobParams] = multiImageQueue
  if (nextJobParams) {
    waitingForRes = true
    const newImage = await createImageJob(nextJobParams)
    if (newImage?.success) {
      multiImageQueue.shift()
    }
    waitingForRes = false
  }
}

export const createImageJob = async (imageParams: CreateImageJob) => {
  const { prompt } = imageParams
  let { numImages = 1 } = imageParams

  if (!prompt || !prompt?.trim()) {
    return {
      success: false,
      status: 'Invalid prompt'
    }
  }

  // @ts-ignore
  if (isNaN(numImages) || numImages < 1 || numImages > 20) {
    numImages = 1
  }

  const imageSize = orientationDetails(imageParams.orientationType || 'square')
  imageParams.orientation = imageSize.orientation
  imageParams.height = imageSize.height
  imageParams.width = imageSize.width

  const clonedParams = Object.assign({}, imageParams)
  if (imageParams.sampler === 'random') {
    clonedParams.sampler = randomSampler(imageParams?.img2img || false)
  }

  // Limit number of currently pending
  // requests so we don't hit API limits.
  const numPending = await pendingCount()
  if (numPending >= 25) {
    return {
      success: false
    }
  }

  const data = await createNewImage(clonedParams)
  const { success } = data

  if (success) {
    const { jobId = '' } = data
    if (!jobId) {
      return {
        success: false,
        status: 'MISSING_JOB_ID'
      }
    }

    jobDetailsQueue.push(jobId)

    clonedParams.jobTimestamp = imageParams.jobTimestamp
      ? imageParams.jobTimestamp
      : Date.now()
    clonedParams.parentJobId = imageParams.parentJobId || jobId

    if (numImages > 1) {
      delete imageParams.numImages

      for (let i = 0; i < numImages - 1; i++) {
        multiImageQueue.push(imageParams)
      }
    }

    await db.pending.add({
      // @ts-ignore
      jobId,
      timestamp: Date.now(),
      ...clonedParams
    })

    return {
      success: true
    }
  }

  return {
    success: false,
    message: data?.message ? data.message : 'Something unfortunate happened.',
    status: data?.status
  }
}

let pendingImageRequest = false
export const getImage = async (jobId: string) => {
  if (pendingImageRequest) {
    return {
      success: false,
      status: 'WAITING_FOR_PENDING_REQUEST'
    }
  }

  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id'
    }
  }

  pendingImageRequest = true
  const data = await getFinishedImage(jobId)
  const { status = '' } = data

  pendingImageRequest = false
  if (data?.success) {
    return {
      jobId,
      ...data
    }
  } else {
    return {
      success: false,
      status
    }
  }
}

export const getCurrentJob = async () => {
  let jobDetails
  const allKeys = await allPendingJobs()
  const [firstJob] = allKeys

  if (!firstJob) {
    return
  }

  const { jobId } = firstJob

  if (jobId) {
    jobDetails = await checkImageJob(jobId)
  }

  if (jobDetails?.success && !jobDetails?.done) {
    await updatePendingJob(
      firstJob.id,
      Object.assign({}, firstJob, {
        queue_position: jobDetails.queue_position,
        wait_time: jobDetails.wait_time
      })
    )
  }

  if (jobDetails?.done) {
    const imageDetails = await getPendingJobDetails(jobId)
    const imgDetails: FinishedImage = await getImage(jobId)

    if (imgDetails?.success && imgDetails?.base64String) {
      deletePendingJobFromDb(jobId)
      await db.completed.add({
        // @ts-ignore
        jobId,
        ...imageDetails,
        ...imgDetails,
        timestamp: Date.now()
      })

      trackEvent({
        event: 'IMAGE_RECEIVED_FROM_API',
        dimensions: `h ${imageDetails.height} x w ${imageDetails.width}`,
        waitTimeSeconds: (
          Math.floor(Date.now() - imageDetails.timestamp) / 1000
        ).toFixed(0)
      })
      trackGaEvent({
        action: 'img_received_from_api',
        params: {
          height: imageDetails.height,
          width: imageDetails.width,
          waitTime: (
            Math.floor(Date.now() - imageDetails.timestamp) / 1000
          ).toFixed(0)
        }
      })
      return {
        success: true,
        jobId,
        newImage: true
      }
    }
  }

  return {
    newImage: false
  }
}

setInterval(() => {
  createMultiImageJob()
  fetchJobDetails()
}, 200)
