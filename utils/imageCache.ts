import { checkImageStatus } from '../api/checkImageStatus'
import { getFinishedImage } from '../api/getFinishedImage'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { CreateImageJob, CreatePendingJob } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJobFromDb,
  getPendingJobDetails,
  pendingCount,
  updatePendingJob
} from './db'
import { createNewImage } from './imageUtils'
import { createPendingJob } from './pendingUtils'

export const initIndexedDb = () => {}

let multiImageQueue: Array<CreateImageJob> = []
let jobDetailsQueue: Array<CreatePendingJob> = []

interface CheckImage {
  success: boolean
  status?: string
  message?: string
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
  const [firstJob]: Array<CreatePendingJob> = jobDetailsQueue

  if (!firstJob) {
    return
  }

  const { jobId: currentJobId } = firstJob

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
          wait_time: (wait_time || 0) + 30
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
    const newImage = await sendJobToApi(nextJobParams)
    if (newImage?.success) {
      multiImageQueue.shift()
    }
    waitingForRes = false
  }
}

export const sendJobToApi = async (imageParams: CreateImageJob) => {
  try {
    const data = await createNewImage(imageParams)
    const { success, jobId, message = '' } = data

    if (success && jobId) {
      // Overwrite params on success.
      imageParams.jobId = jobId
      imageParams.timestamp = Date.now()
      imageParams.jobStatus = 'processing'

      const jobDetailsFromApi = await checkImageJob(jobId)
      const {
        success: detailsSuccess,
        wait_time,
        queue_position,
        message
      } = jobDetailsFromApi

      if (detailsSuccess) {
        imageParams.timestamp = Date.now()
        imageParams.wait_time = (wait_time || 0) + 30
        imageParams.queue_position = queue_position
      }

      await db.pending.add({
        ...imageParams
      })

      return {
        success: true,
        message
      }
    } else {
      delete imageParams.base64String
      trackEvent({
        type: 'ERROR',
        event: 'UNABLE_TO_SEND_IMAGE_REQUEST',
        imageParams: { ...imageParams },
        messageFromApi: message
      })

      return {
        success: false,
        status: 'UNABLE_TO_SEND_IMAGE_REQUEST',
        messageFromApi: message
      }
    }
  } catch (err) {
    console.log(`Error: Unable to send job to API`)
    console.log(err)

    delete imageParams.base64String
    trackEvent({
      type: 'ERROR',
      event: 'SEND_TO_API_ERROR',
      imageParams: { ...imageParams }
    })

    return {
      success: false,
      status: 'UNABLE_TO_SEND_IMAGE_REQUEST'
    }
  }
}

export const createImageJob = async (imageParams: CreatePendingJob) => {
  const jobsToSend = createPendingJob(imageParams)

  // Limit number of currently pending
  // requests so we don't hit API limits.
  const numPending = await pendingCount()
  if (numPending >= 25) {
    return {
      success: false
    }
  }

  if (jobsToSend.length === 0) {
    return {
      success: false
    }
  }

  if (jobsToSend.length === 1) {
    const res = await sendJobToApi(jobsToSend[0])
    const { success, status, message } = res

    return {
      success,
      status,
      message
    }
  } else if (jobsToSend.length > 1) {
    const res = await sendJobToApi(jobsToSend[0])
    const { success, status, message } = res

    if (success) {
      jobsToSend.shift()
      multiImageQueue = [...jobsToSend]
    }

    return {
      success,
      status,
      message
    }
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

export const hackyMultiJobCheck = async () => {
  const allKeys = await allPendingJobs()
  const [firstJob, secondJob, thirdJob, fourthJob] = allKeys

  if (firstJob) {
    await checkCurrentJob(firstJob)
  }

  if (secondJob) {
    await checkCurrentJob(secondJob)
  }

  if (thirdJob) {
    await checkCurrentJob(thirdJob)
  }

  if (fourthJob) {
    await checkCurrentJob(fourthJob)
  }
}

export const checkCurrentJob = async (imageDetails: any) => {
  let jobDetails

  const { jobId } = imageDetails

  if (jobId) {
    jobDetails = await checkImageJob(jobId)
  }

  if (jobDetails?.success && !jobDetails?.done) {
    await updatePendingJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        queue_position: jobDetails.queue_position,
        wait_time: (jobDetails.wait_time || 0) + 30
      })
    )
  }

  if (jobDetails?.done) {
    const imageDetails = await getPendingJobDetails(jobId)
    const imgDetailsFromApi: FinishedImage = await getImage(jobId)

    if (imgDetailsFromApi?.success && imgDetailsFromApi?.base64String) {
      imageDetails.done = true
      imageDetails.jobStatus = 'done'
      imageDetails.timestamp = Date.now()

      await deletePendingJobFromDb(jobId)
      await db.completed.add({
        ...imageDetails,
        ...imgDetailsFromApi
      })

      setNewImageReady(imageDetails.jobId)
      setShowImageReadyToast(true)

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
