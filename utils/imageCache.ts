import { CreateImageJob } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJob,
  getPendingJobDetails
} from './db'
import { sleep } from './sleep'

export const initIndexedDb = () => {}

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
  pendingCheckRequest = false

  return {
    success: data.success,
    jobId,
    ...data
  }
}

const multiImageJob = async ({
  numImages = 1,
  idx = 0,
  params,
  apikey
}: {
  numImages: number
  idx: number
  params: CreateImageJob
  apikey: string
}) => {
  if (idx >= numImages) {
    // TODO: Really poor assumption, but right now, we will always assume this succeeds.
    return {
      success: true
    }
  }

  const res = await fetch(`/artbot/api/create`, {
    method: 'POST',
    body: JSON.stringify(Object.assign({}, params, { apikey })),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  const { id: jobId } = data

  if (jobId) {
    const jobDetails = await checkImageJob(jobId)
    const { success, queue_position, wait_time } = jobDetails

    if (!success) {
      return {
        success: false,
        jobId,
        message: jobDetails?.message
      }
    }

    await db.pending.add({
      jobId,
      timestamp: Date.now(),
      queue_position,
      wait_time,
      ...params
    })
  }

  setTimeout(() => {
    multiImageJob({ numImages, idx: ++idx, params, apikey })
  }, 250)
}

export const createImageJob = async (imageParams: CreateImageJob) => {
  const apikey = localStorage.getItem('apikey') || '0000000000'
  const useTrusted = localStorage.getItem('useTrusted') || false

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

  const params: CreateImageJob = {
    prompt: imageParams.prompt,
    height: imageParams.height || 512,
    width: imageParams.width || 512,
    cfg_scale: imageParams.cfg_scale || '12.0',
    steps: imageParams.steps || 50,
    sampler: imageParams.sampler || 'k_euler_a',
    useTrusted: useTrusted === 'true' ? true : false
  }

  if (imageParams.seed) {
    params.seed = imageParams.seed
  }

  if (numImages > 1) {
    multiImageJob({
      numImages,
      idx: 0,
      params,
      apikey
    })

    await sleep(numImages + 1 * 250)

    return {
      success: true
    }
  }

  const res = await fetch(`/artbot/api/create`, {
    method: 'POST',
    body: JSON.stringify(Object.assign({}, params, { apikey })),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  const { id: jobId } = data

  if (jobId) {
    const jobDetails = await checkImageJob(jobId)
    const { success, queue_position, wait_time } = jobDetails

    if (!success) {
      return {
        success: false,
        jobId,
        message: jobDetails?.message
      }
    }

    await db.pending.add({
      jobId,
      timestamp: Date.now(),
      queue_position,
      wait_time,
      ...params
    })

    return {
      success: true,
      ...params,
      jobDetails
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
