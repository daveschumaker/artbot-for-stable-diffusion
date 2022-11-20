import { userInfoStore } from '../store/userStore'
import { checkImageStatus } from '../api/checkImageStatus'
import { getFinishedImage } from '../api/getFinishedImage'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { CreateImageJob, CreatePendingJob, JobStatus } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJobFromDb,
  getPendingJobDetails,
  updateAllPendingJobs,
  updatePendingJob
} from './db'
import { createNewImage } from './imageUtils'
import { createPendingJob } from './pendingUtils'
import { sleep } from './sleep'
import {
  CREATE_NEW_JOB_INTERVAL,
  MAX_CONCURRENT_JOBS_ANON,
  MAX_CONCURRENT_JOBS_USER
} from '../constants'

export const initIndexedDb = () => {}

// Dynamically change fetch interval
// (e.g., in cases where there are too many parallel requests)
let FETCH_INTERVAL_SEC = CREATE_NEW_JOB_INTERVAL

// Limit max jobs for anon users. If user is logged in,
// let them run more jobs at once.
let MAX_JOBS = MAX_CONCURRENT_JOBS_ANON
interface CheckImage {
  success: boolean
  status?: string
  message?: string
  jobId?: string
  done?: boolean
  queue_position?: number
  wait_time?: number
  processing?: number
  finished?: number
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

export const createMultiImageJob = async () => {
  if (typeof window === 'undefined') {
    return
  }

  if (document.visibilityState !== 'visible') {
    return
  }

  if (userInfoStore.state.loggedIn) {
    MAX_JOBS = MAX_CONCURRENT_JOBS_USER
  }

  const queuedCount = (await allPendingJobs(JobStatus.Queued)) || []
  if (queuedCount.length < MAX_JOBS) {
    const pendingJobs = await allPendingJobs(JobStatus.Waiting)
    const [nextJobParams] = pendingJobs

    if (nextJobParams) {
      await sendJobToApi(nextJobParams)
    }
  }
}

export const sendJobToApi = async (imageParams: CreateImageJob) => {
  if (!imageParams) {
    return
  }

  try {
    const data = await createNewImage(imageParams)
    // @ts-ignore
    const { success, jobId, status, message = '' } = data || {}

    // Skip for now and try again soon...
    if (
      !success &&
      status === 'MAX_REQUEST_LIMIT' &&
      FETCH_INTERVAL_SEC < 15000
    ) {
      FETCH_INTERVAL_SEC += 1000
      return
    }

    // Handle condition where API ignores request.
    // Probably rate limited?
    if (!success && !jobId && !status) {
      return
    }

    if (success && jobId) {
      FETCH_INTERVAL_SEC = CREATE_NEW_JOB_INTERVAL

      // Overwrite params on success.
      imageParams.jobId = jobId
      imageParams.timestamp = Date.now()
      imageParams.jobStatus = JobStatus.Queued

      await updatePendingJob(imageParams.id, Object.assign({}, imageParams))

      const jobDetailsFromApi = (await checkImageJob(jobId)) || {}
      if (typeof jobDetailsFromApi?.success === 'undefined') {
        return {
          success: false,
          message: 'Unable to send request...'
        }
      }

      const {
        success: detailsSuccess,
        wait_time = 0,
        queue_position,
        message
      } = jobDetailsFromApi

      if (detailsSuccess) {
        //@ts-ignore
        if (!imageParams.initWaitTime) {
          imageParams.initWaitTime = wait_time
          //@ts-ignore
        } else if (wait_time > imageParams.initWaitTime) {
          imageParams.initWaitTime = wait_time
        }

        imageParams.timestamp = Date.now()
        imageParams.wait_time = wait_time
        imageParams.queue_position = queue_position
      }

      await updatePendingJob(
        imageParams.id,
        Object.assign({}, imageParams, {
          queue_position: imageParams.queue_position,
          wait_time: imageParams.wait_time || 0
        })
      )

      return {
        success: true,
        message
      }
    } else {
      await updatePendingJob(
        imageParams.id,
        Object.assign({}, imageParams, {
          jobStatus: JobStatus.Error,
          errorMessage: message
        })
      )

      if (imageParams.parentJobId) {
        await updateAllPendingJobs(imageParams.parentJobId, {
          jobStatus: JobStatus.Error,
          errorMessage: message
        })
      }

      if (imageParams.source_image) {
        // @ts-ignore
        imageParams.has_source_image = true
      }

      delete imageParams.base64String
      delete imageParams.source_image
      delete imageParams.canvasStore
      trackEvent({
        event: 'ERROR',
        action: 'UNABLE_TO_SEND_IMAGE_REQUEST',
        data: {
          status,
          imageParams: { ...imageParams },
          messageFromApi: message
        }
      })

      return {
        success: false,
        status: status || 'UNABLE_TO_SEND_IMAGE_REQUEST',
        message
      }
    }
  } catch (err) {
    await updatePendingJob(
      imageParams.id,
      Object.assign({}, imageParams, {
        jobStatus: JobStatus.Error,
        errorMessage: 'An unknown error occurred...'
      })
    )

    if (imageParams.parentJobId) {
      await updateAllPendingJobs(imageParams.parentJobId, {
        jobStatus: JobStatus.Error,
        errorMessage: 'An unknown error occurred...'
      })
    }

    console.log(`Error: Unable to send job to API`)
    console.log(err)

    if (imageParams.source_image) {
      imageParams.has_source_image = true
    }

    if (imageParams.source_mask) {
      imageParams.has_source_mask = true
    }

    delete imageParams.base64String
    delete imageParams.source_image
    delete imageParams.source_mask
    delete imageParams.canvasStore
    trackEvent({
      event: 'ERROR',
      action: 'SEND_TO_API_ERROR',
      data: {
        imageParams: { ...imageParams },
        // @ts-ignore
        errMessage: err?.message || ''
      }
    })

    return {
      success: false,
      status: 'UNABLE_TO_SEND_IMAGE_REQUEST'
    }
  }
}

export const createImageJob = async (imageParams: CreatePendingJob) => {
  await createPendingJob(imageParams)

  return {
    success: true
  }
}

let pendingImageRequest = false
export const getImage = async (jobId: string) => {
  if (pendingImageRequest) {
    return {
      success: false,
      status: 'WAITING_FOR_PENDING_REQUEST',
      message: ''
    }
  }

  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id',
      message: ''
    }
  }

  pendingImageRequest = true
  const data = await getFinishedImage(jobId)
  const { status = '' } = data

  pendingImageRequest = false
  if (data?.success) {
    return {
      jobId,
      status: 'SUCCESS',
      message: '',
      ...data
    }
  } else {
    return {
      success: false,
      status,
      message: ''
    }
  }
}

export const hackyMultiJobCheck = async () => {
  const allKeys = (await allPendingJobs()) || []

  const queuedOrProcessing = allKeys.filter((job: any = {}) => {
    return (
      job.jobStatus === JobStatus.Queued ||
      job.jobStatus === JobStatus.Processing
    )
  })

  const [firstJob, secondJob, thirdJob, fourthJob, fifthJob] =
    queuedOrProcessing

  if (firstJob) {
    await checkCurrentJob(firstJob)
  }

  await sleep(300)

  if (secondJob) {
    await checkCurrentJob(secondJob)
  }

  await sleep(300)

  if (thirdJob) {
    await checkCurrentJob(thirdJob)
  }

  if (MAX_JOBS >= 4) {
    await sleep(300)

    if (fourthJob) {
      await checkCurrentJob(fourthJob)
    }
  }

  if (MAX_JOBS >= 5) {
    await sleep(300)

    if (fifthJob) {
      await checkCurrentJob(fifthJob)
    }
  }
}

export const checkCurrentJob = async (imageDetails: any) => {
  let jobDetails

  if (document.visibilityState !== 'visible') {
    return
  }

  const { jobId } = imageDetails

  if (jobId) {
    jobDetails = await checkImageJob(jobId)
  }

  if (jobDetails?.processing === 1) {
    imageDetails.jobStatus = JobStatus.Processing
  }

  if (jobDetails?.success && !jobDetails?.done) {
    //@ts-ignore
    if (!imageDetails.initWaitTime) {
      imageDetails.initWaitTime = jobDetails.wait_time
      //@ts-ignore
    }

    if (
      jobDetails.wait_time &&
      jobDetails.wait_time > imageDetails.initWaitTime
    ) {
      imageDetails.initWaitTime = jobDetails.wait_time
    }

    await updatePendingJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        queue_position: jobDetails.queue_position,
        wait_time: jobDetails.wait_time || 0
      })
    )
  }

  if (jobDetails?.done) {
    const imageDetails = await getPendingJobDetails(jobId)
    const imgDetailsFromApi: FinishedImage = await getImage(jobId)

    if (imgDetailsFromApi?.success && imgDetailsFromApi?.base64String) {
      imageDetails.done = true
      imageDetails.jobStatus = JobStatus.Done
      imageDetails.timestamp = Date.now()

      const job = {
        ...imageDetails,
        ...imgDetailsFromApi
      }
      await updatePendingJob(
        imageDetails.id,
        Object.assign({}, job, {
          jobStatus: JobStatus.Done
        })
      )
      // Catch a potential race condition where the same jobId can be added twice.
      // This might happen when multiple tabs are open.
      try {
        await db.completed.add(
          Object.assign({}, job, {
            jobStatus: JobStatus.Done
          })
        )
      } catch (err) {
        return {
          newImage: false
        }
      }

      setNewImageReady(imageDetails.jobId)
      setShowImageReadyToast(true)

      trackEvent({
        event: 'IMAGE_RECEIVED_FROM_API',
        data: {
          dimensions: `h ${imageDetails.height} x w ${imageDetails.width}`,
          waitTimeSeconds: imageDetails.jobTimestamp
            ? (
                Math.floor(Date.now() - imageDetails.jobTimestamp) / 1000
              ).toFixed(0)
            : 0
        }
      })
      trackGaEvent({
        action: 'img_received_from_api',
        params: {
          height: imageDetails.height,
          width: imageDetails.width,
          waitTime: imageDetails.jobTimestamp
            ? (
                Math.floor(Date.now() - imageDetails.jobTimestamp) / 1000
              ).toFixed(0)
            : 0
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

const createJobInterval = () => {
  createMultiImageJob()
  setTimeout(() => {
    createJobInterval()
  }, FETCH_INTERVAL_SEC)
}

createJobInterval()
