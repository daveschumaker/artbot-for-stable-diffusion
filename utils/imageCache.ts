import { userInfoStore } from '../store/userStore'
import { checkImageStatus } from '../api/checkImageStatus'
import { getFinishedImage } from '../api/getFinishedImage'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../store/appStore'
import { CreateImageJob, JobStatus } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJobFromDb,
  getImageDetails,
  getPendingJobDetails,
  updateAllPendingJobs,
  updatePendingJob
} from './db'
import { createNewImage, generateBase64Thumbnail } from './imageUtils'
import { createPendingJob } from './pendingUtils'
import {
  CREATE_NEW_JOB_INTERVAL,
  MAX_CONCURRENT_JOBS_ANON,
  MAX_CONCURRENT_JOBS_USER
} from '../_constants'
import { isAppActive, logError } from './appUtils'
import CreateImageRequest from '../models/CreateImageRequest'
import { hasPromptMatrix, promptMatrix } from './promptUtils'

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
  status?: string
  message?: string
}

export const checkImageJob = async (jobId: string): Promise<CheckImage> => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid jobId'
    }
  }

  try {
    const data: CheckImage = await checkImageStatus(jobId)

    const { success, status = '' } = data

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

  if (!isAppActive()) {
    return
  }

  if (userInfoStore.state.loggedIn) {
    MAX_JOBS = MAX_CONCURRENT_JOBS_USER
  }

  const queuedCount = (await allPendingJobs(JobStatus.Processing)) || []

  if (queuedCount.length < MAX_JOBS) {
    const pendingJobs = (await allPendingJobs(JobStatus.Waiting)) || []
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
    imageParams.jobStatus = JobStatus.Requested
    await updatePendingJob(imageParams.id, Object.assign({}, imageParams))

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
      imageParams.jobStatus = JobStatus.Waiting
      await updatePendingJob(imageParams.id, Object.assign({}, imageParams))
      return
    }

    // Handle condition where API ignores request.
    // Probably rate limited?
    if (!success && !jobId && !status) {
      imageParams.jobStatus = JobStatus.Waiting
      await updatePendingJob(imageParams.id, Object.assign({}, imageParams))
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
        imageParams.jobStatus = JobStatus.Waiting
        await updatePendingJob(imageParams.id, Object.assign({}, imageParams))
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

      const skipSetErrorOnAll =
        status === 'UNKNOWN_ERROR' ||
        status === 'QUESTIONABLE_PROMPT_ERROR' ||
        status === 'INVALID_IMAGE_FROM_API'
      if (imageParams.parentJobId && !skipSetErrorOnAll) {
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

export const createImageJob = async (newImageRequest: CreateImageRequest) => {
  if (newImageRequest.useMultiSteps && newImageRequest.multiSteps.length > 0) {
    for (const idx in newImageRequest.multiSteps) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.steps = newImageRequest.multiSteps[idx]
      imageRequest.useMultiSteps = false
      imageRequest.multiSteps = []

      await createPendingJob(imageRequest)
    }
  }
  if (
    newImageRequest.useMultiGuidance &&
    newImageRequest.multiGuidance.length > 0
  ) {
    for (const idx in newImageRequest.multiGuidance) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.cfg_scale = newImageRequest.multiGuidance[idx]
      imageRequest.useMultiGuidance = false
      imageRequest.multiGuidance = []

      await createPendingJob(imageRequest)
    }
  } else if (hasPromptMatrix(newImageRequest.prompt)) {
    // Check for prompt matrix
    const matrixPrompts = [...promptMatrix(newImageRequest.prompt)]

    for (const idx in matrixPrompts) {
      newImageRequest.prompt = matrixPrompts[idx]
      await createPendingJob(newImageRequest)
    }
  } else {
    await createPendingJob(newImageRequest)
  }

  return {
    success: true
  }
}

export const getImage = async (jobId: string) => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id',
      message: ''
    }
  }

  const data = await getFinishedImage(jobId)
  const { status = '', message = '' } = data

  if (data?.success) {
    return {
      jobId,
      status: 'SUCCESS',
      message,
      ...data
    }
  } else {
    return {
      success: false,
      status,
      message,
      jobId
    }
  }
}

export const addCompletedJobToDb = async ({
  jobDetails,
  thumbnail = '',
  errorCount = 0
}: {
  jobDetails: any
  thumbnail: string
  errorCount?: number
}) => {
  // Catch a potential race condition where the same jobId can be added twice.
  // This might happen when multiple tabs are open.
  try {
    if (errorCount >= 5) {
      return { success: false }
    }

    // @ts-ignore
    if (window.DEBUG_THUMBNAIL) {
      console.log(``)
      console.log(`imgDetailsFromApi?`, jobDetails)
      console.log(`thumbnail generated?`, thumbnail)
    }

    delete jobDetails.id
    await db.completed.put(
      Object.assign({}, jobDetails, {
        jobStatus: JobStatus.Done,
        thumbnail
      })
    )

    return { success: true }
  } catch (err: any) {
    errorCount++

    if (
      err.name === 'QuotaExceededError' ||
      (err.inner && err.inner.name === 'QuotaExceededError')
    ) {
      // Handle a strange error the happens for... some reason?
      // https://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError

      if (errorCount >= 5) {
        logError({
          path: window.location.href,
          errorMessage: [
            'imageCache.checkCurrentJob',
            'Unable to add completed item to db'
          ].join('\n'),
          errorInfo: err?.message,
          errorType: 'client-side',
          username: userInfoStore.state.username
        })
      }

      await addCompletedJobToDb({
        jobDetails,
        thumbnail,
        errorCount
      })
    } else {
      logError({
        path: window.location.href,
        errorMessage: [
          'imageCache.checkCurrentJob',
          'Unable to add completed item to db'
        ].join('\n'),
        errorInfo: err?.message,
        errorType: 'client-side',
        username: userInfoStore.state.username
      })

      return {
        success: false
      }
    }
  }
}

export const checkCurrentJob = async (imageDetails: any) => {
  let jobDetails

  if (!isAppActive() || !appInfoStore.state.primaryWindow) {
    return
  }

  const { jobId } = imageDetails

  if (jobId) {
    jobDetails = await checkImageJob(jobId)
  }

  if (jobDetails?.processing === 1) {
    imageDetails.jobStatus = JobStatus.Processing
    await updatePendingJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        queue_position: jobDetails.queue_position,
        wait_time: jobDetails.wait_time || 0
      })
    )
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

    if (imgDetailsFromApi?.status === 'WORKER_GENERATION_ERROR') {
      const jobTimestamp = imageDetails?.timestamp / 1000 || 0
      const currentTimestamp = Date.now() / 1000

      if (currentTimestamp - jobTimestamp > 60) {
        await updatePendingJob(
          imageDetails.id,
          Object.assign({}, imageDetails, {
            jobStatus: JobStatus.Error,
            errorMessage:
              'The worker GPU processing this request encountered an error. Retry?'
          })
        )
      }

      return {
        success: false,
        status: 'NOT_FOUND'
      }
    }

    if (imgDetailsFromApi?.status === 'NOT_FOUND') {
      const jobTimestamp = imageDetails.timestamp / 1000
      const currentTimestamp = Date.now() / 1000

      if (currentTimestamp - jobTimestamp > 300) {
        await updatePendingJob(
          imageDetails.id,
          Object.assign({}, imageDetails, {
            jobStatus: JobStatus.Error,
            errorMessage:
              'Job has gone stale and has been removed from the Stable Horde backend. Retry?'
          })
        )

        return {
          success: false,
          status: 'NOT_FOUND'
        }
      }

      return {
        success: false,
        status: 'NOT_FOUND'
      }
    }

    if (imgDetailsFromApi?.status === 'INVALID_IMAGE_FROM_API') {
      await updatePendingJob(
        imageDetails.id,
        Object.assign({}, imageDetails, {
          jobStatus: JobStatus.Error,
          errorMessage: imgDetailsFromApi.message
        })
      )

      return {
        success: false,
        status: 'INVALID_IMAGE_FROM_API'
      }
    }

    if (
      imageDetails &&
      imgDetailsFromApi?.success &&
      imgDetailsFromApi?.base64String
    ) {
      imageDetails.done = true
      imageDetails.jobStatus = JobStatus.Done
      imageDetails.timestamp = Date.now()

      const job = {
        ...imageDetails,
        ...imgDetailsFromApi
      }

      let thumbnail: string = ''
      if (appInfoStore.state.primaryWindow) {
        const thumbnail = await generateBase64Thumbnail(
          imgDetailsFromApi.base64String,
          jobId
        )
        await updatePendingJob(
          imageDetails.id,
          Object.assign({}, job, {
            timestamp: Date.now(),
            jobStatus: JobStatus.Done,
            thumbnail
          })
        )
      }

      if (appInfoStore.state.primaryWindow) {
        const result = await addCompletedJobToDb({
          jobDetails: job,
          thumbnail
        })

        if (!result?.success) {
          return {
            success: false
          }
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
