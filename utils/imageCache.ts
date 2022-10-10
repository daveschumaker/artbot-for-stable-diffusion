import { CreateImageJob } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJob,
  getPendingJobDetails,
  updatePendingJob
} from './db'
import { createNewImage } from './imageUtils'

export const initIndexedDb = () => {}

const multiImageQueue: Array<CreateImageJob> = []
const jobDetailsQueue: Array<string> = []

let pendingCheckRequest = false
export const checkImageJob = async (jobId: string) => {
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
  const res = await fetch(`/artbot/api/check`, {
    method: 'POST',
    body: JSON.stringify({
      id: jobId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  const { status = '' } = data
  pendingCheckRequest = false

  if (status === 'NOT_FOUND') {
    await deletePendingJob(jobId)
    return {
      success: false,
      status: 'NOT_FOUND'
    }
  }

  pendingCheckRequest = false

  return {
    success: data.success,
    jobId,
    ...data
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
    if (newImage.success) {
      multiImageQueue.shift()
    }
    waitingForRes = false
  }
}

setInterval(() => {
  createMultiImageJob()
  fetchJobDetails()
}, 500)

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
  if (isNaN(numImages) || numImages < 1 || numImages > 8) {
    numImages = 1
  }

  const data = await createNewImage(imageParams)
  const { success } = data

  if (success) {
    const { jobId } = data
    jobDetailsQueue.push(jobId)

    imageParams.parentJobId = imageParams.parentJobId || jobId

    if (numImages > 1) {
      delete imageParams.numImages

      for (let i = 0; i < numImages - 1; i++) {
        multiImageQueue.push(imageParams)
      }
    }

    await db.pending.add({
      jobId,
      timestamp: Date.now(),
      ...imageParams
    })

    return {
      success: true
    }
  }

  return {
    success: false,
    message: data?.message ? data.message : 'Something unfortunate happened.'
  }
}

export const getImage = async (jobId: string) => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id'
    }
  }

  const res = await fetch(`/artbot/api/get-image`, {
    method: 'POST',
    body: JSON.stringify({
      id: jobId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  if (data?.success) {
    return {
      success: true,
      jobId,
      ...data
    }
  } else {
    return {
      success: false
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
    // @ts-ignore
    jobDetails = await checkImageJob(jobId)
  }

  // TODO: check verification message for missing images / jobs
  if (jobDetails?.message) {
    if (jobDetails.message.indexOf('not found') >= 0) {
      deletePendingJob(jobId)
      return
    }
  }

  if (jobDetails?.done) {
    // @ts-ignore
    const imageDetails = await getPendingJobDetails(jobId)
    deletePendingJob(jobId)

    // @ts-ignore
    const imgDetails = await getImage(jobId)

    await db.completed.add({
      jobId,
      ...imageDetails,
      ...imgDetails,
      timestamp: Date.now()
    })

    return {
      success: true,
      newImage: true
    }
  }

  return {
    newImage: false
  }
}

let hasNewImage = false

export const getHasNewImage = () => {
  return hasNewImage
}

export const setHasNewImage = (bool: boolean) => {
  hasNewImage = bool
}
