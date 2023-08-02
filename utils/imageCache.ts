import { userInfoStore } from '../store/userStore'
import { checkImageStatus } from '../api/checkImageStatus'
import { getFinishedImage } from '../api/getFinishedImage'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast,
  setStorageQuotaLimit
} from '../store/appStore'
import {
  CheckImage,
  CreateImageJob,
  FinishedImageResponse,
  FinishedImageResponseError,
  JobStatus
} from '../types'
import {
  addCompletedJobToDexie,
  addImageToDexie,
  deletePendingJobFromDb,
  getImageDetails,
  updateAllPendingJobs,
  updatePendingJobInDexie
} from './db'
import { createNewImage } from './imageUtils'
import { createPendingJob } from './pendingUtils'
import {
  CREATE_NEW_JOB_INTERVAL,
  MAX_CONCURRENT_JOBS_ANON,
  MAX_CONCURRENT_JOBS_USER
} from '../_constants'
import { isAppActive, logError } from './appUtils'
import CreateImageRequest from '../models/CreateImageRequest'
import { hasPromptMatrix, promptMatrix } from './promptUtils'
import { sleep } from './sleep'
import { logToConsole } from './debugTools'
import {
  deletePendingJob,
  getAllPendingJobs,
  updateAllPendingJobsV2,
  updatePendingJobId,
  updatePendingJobV2
} from 'controllers/pendingJobsCache'

export const initIndexedDb = () => {}

// Dynamically change fetch interval
// (e.g., in cases where there are too many parallel requests)
let FETCH_INTERVAL_SEC = CREATE_NEW_JOB_INTERVAL

// Limit max jobs for anon users. If user is logged in,
// let them run more jobs at once.
let MAX_JOBS = MAX_CONCURRENT_JOBS_ANON

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
      deletePendingJob(jobId)
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

  const queuedCount = (await getAllPendingJobs(JobStatus.Processing)) || []

  if (queuedCount.length < MAX_JOBS) {
    const pendingJobs = (await getAllPendingJobs(JobStatus.Waiting)) || []
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
    updatePendingJobV2(imageParams)
    // await updatePendingJobInDexie(imageParams.id, Object.assign({}, imageParams))

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
      updatePendingJobV2(imageParams)
      // await updatePendingJobInDexie(imageParams.id, Object.assign({}, imageParams))
      return
    }

    // Handle condition where API ignores request.
    // Probably rate limited?
    if (!success && !jobId && !status) {
      imageParams.jobStatus = JobStatus.Waiting
      updatePendingJobV2(imageParams)
      // await updatePendingJobInDexie(imageParams.id, Object.assign({}, imageParams))
      return
    }

    // Success! jobId has changed.
    if (success && jobId) {
      FETCH_INTERVAL_SEC = CREATE_NEW_JOB_INTERVAL

      // This replaces ArtBot generated jobId with jobId from API.
      updatePendingJobId(imageParams.jobId, jobId)

      // Overwrite params on success.
      imageParams.jobId = jobId
      imageParams.timestamp = Date.now()
      imageParams.jobStatus = JobStatus.Queued

      // Need both these here to handle updating jobId in both database and in-memory cache.
      updatePendingJobV2(imageParams)
      await updatePendingJobInDexie(
        imageParams.id,
        Object.assign({}, imageParams)
      )

      const jobDetailsFromApi = (await checkImageJob(jobId)) || {}

      if (typeof jobDetailsFromApi?.success === 'undefined') {
        imageParams.jobStatus = JobStatus.Waiting
        imageParams.is_possible = jobDetailsFromApi.is_possible

        await updatePendingJobInDexie(
          imageParams.id,
          Object.assign({}, imageParams)
        )
        updatePendingJobV2(imageParams)
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

      updatePendingJobV2(
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
      await updatePendingJobInDexie(
        imageParams.id,
        Object.assign({}, imageParams, {
          jobStatus: JobStatus.Error,
          errorMessage: message
        })
      )

      updatePendingJobV2(
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

        updateAllPendingJobsV2(JobStatus.Error, {
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
    await updatePendingJobInDexie(
      imageParams.id,
      Object.assign({}, imageParams, {
        jobStatus: JobStatus.Error,
        errorMessage: 'An unknown error occurred...'
      })
    )

    updatePendingJobV2(
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
      updateAllPendingJobsV2(JobStatus.Error, {
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
  const pendingJobArray: any[] = []

  const addToPendingJobArray = async (
    newItems: any[],
    fieldsToOverwrite: string[]
  ) => {
    const newPendingJobArray = []

    if (pendingJobArray.length > 0) {
      // Loop over existing items in pendingJobArray and add new items
      for (const existingItem of pendingJobArray) {
        for (const newItem of newItems) {
          const imageRequest = {
            ...existingItem, // Clone existingItem properties
            // Overwrite the specified fields with the new values
            ...Object.fromEntries(
              fieldsToOverwrite.map((field) => {
                return [field, newItem[field]]
              })
            )
          }
          newPendingJobArray.push(imageRequest)
        }
      }
    } else {
      // If pendingJobArray is empty, directly add new items
      for (const newItem of newItems) {
        const imageRequest = { ...newItem } // Clone newItem properties
        newPendingJobArray.push({ ...imageRequest })
      }
    }

    // Update the pendingJobArray with the new items
    pendingJobArray.length = 0
    pendingJobArray.push(...newPendingJobArray)
  }

  if (newImageRequest.useMultiClip && newImageRequest.multiClip.length > 0) {
    const tempArray = []
    for (const idx in newImageRequest.multiClip) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.clipskip = newImageRequest.multiClip[idx]
      imageRequest.useMultiClip = false
      imageRequest.multiClip = []

      tempArray.push({ ...newImageRequest })
    }

    addToPendingJobArray(tempArray, ['clipskip'])
  }

  if (
    newImageRequest.useMultiDenoise &&
    newImageRequest.multiDenoise.length > 0
  ) {
    const tempArray = []

    for (const idx in newImageRequest.multiDenoise) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.denoising_strength = newImageRequest.multiDenoise[idx]
      imageRequest.useMultiDenoise = false
      imageRequest.multiDenoise = []

      tempArray.push({ ...newImageRequest })
    }

    addToPendingJobArray(tempArray, ['denoising_strength'])
  }

  if (
    newImageRequest.useMultiGuidance &&
    newImageRequest.multiGuidance.length > 0
  ) {
    const tempArray = []

    for (const idx in newImageRequest.multiGuidance) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.cfg_scale = newImageRequest.multiGuidance[idx]
      imageRequest.useMultiGuidance = false
      imageRequest.multiGuidance = []
      tempArray.push({ ...newImageRequest })
    }

    addToPendingJobArray(tempArray, ['cfg_scale'])
  }

  if (newImageRequest.useMultiSteps && newImageRequest.multiSteps.length > 0) {
    const tempArray = []

    for (const idx in newImageRequest.multiSteps) {
      const imageRequest = Object.assign({}, newImageRequest)
      imageRequest.steps = newImageRequest.multiSteps[idx]
      imageRequest.useMultiSteps = false
      imageRequest.multiSteps = []

      tempArray.push({ ...newImageRequest })
    }

    addToPendingJobArray(tempArray, ['steps'])
  }

  if (
    hasPromptMatrix(newImageRequest.prompt) ||
    hasPromptMatrix(newImageRequest.negative)
  ) {
    // Check for prompt matrix
    const matrixPrompts = [...promptMatrix(newImageRequest.prompt)]
    const matrixNegative = [...promptMatrix(newImageRequest.negative)]

    if (matrixPrompts.length >= 1 && matrixNegative.length === 0) {
      const tempArray = []

      for (const idx in matrixPrompts) {
        newImageRequest.prompt = matrixPrompts[idx]
        tempArray.push({ ...newImageRequest })
      }

      addToPendingJobArray(tempArray, ['prompt'])
    } else if (matrixPrompts.length === 0 && matrixNegative.length >= 1) {
      const tempArray = []

      for (const idx in matrixNegative) {
        newImageRequest.negative = matrixNegative[idx]
        tempArray.push({ ...newImageRequest })
      }

      addToPendingJobArray(tempArray, ['negative'])
    } else if (matrixPrompts.length >= 1 && matrixNegative.length >= 1) {
      const tempArray = []

      for (const idx in matrixPrompts) {
        for (const idx2 in matrixNegative) {
          newImageRequest.prompt = matrixPrompts[idx]
          newImageRequest.negative = matrixNegative[idx2]

          tempArray.push({ ...newImageRequest })
        }
      }

      addToPendingJobArray(tempArray, ['prompt', 'negative'])
    }
  }

  if (pendingJobArray.length === 0) {
    await createPendingJob(newImageRequest)
  } else {
    for (const job of pendingJobArray) {
      await createPendingJob(job as unknown as CreateImageRequest)
      await sleep(100)
    }
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
  return data
}

export const addCompletedJobToDb = async ({
  jobDetails
}: {
  jobDetails: any
  errorCount?: number
}) => {
  // Catch a potential race condition where the same jobId can be added twice.
  // This might happen when multiple tabs are open.
  try {
    const clonedJobDetails = Object.assign({}, jobDetails)

    getImageDetails.delete(jobDetails.jobId) // Bust memo cache
    const jobExists = await getImageDetails(jobDetails.jobId)

    if (jobExists) {
      return { success: true }
    }

    delete clonedJobDetails.id
    await addCompletedJobToDexie({
      ...clonedJobDetails,
      jobStatus: JobStatus.Done
    })
    getImageDetails.delete(jobDetails.jobId) // Bust memo cache... again.

    logToConsole({
      data: jobDetails,
      name: 'imageCache.addCompletedJobToDb.success',
      debugKey: 'ADD_COMPLETED_JOB_TO_DB'
    })

    return { success: true }
  } catch (err: any) {
    logToConsole({
      data: err,
      name: 'imageCache.addCompletedJobToDb.error',
      debugKey: 'ADD_COMPLETED_JOB_TO_DB'
    })

    // Storage is full.
    if (err.message && err.message.includes('QuotaExceededError')) {
      logError({
        path: window.location.href,
        errorMessage: [
          'imageCache.checkCurrentJob.errorCountExceeded',
          'QuotaExceededError: Unable to add completed item to db'
        ].join('\n'),
        errorInfo: err?.message,
        errorType: 'client-side',
        username: userInfoStore.state.username
      })

      setStorageQuotaLimit(true)
      return { success: false }
    }

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

export const checkCurrentJob = async (imageDetails: any) => {
  let jobDetails: any = Object.assign({}, imageDetails)

  if (!isAppActive()) {
    return
  }

  const { jobId } = imageDetails

  if (!jobId) {
    return
  }

  const checkJobResult = await checkImageJob(jobId)

  if (appInfoStore.state.storageQuotaLimit) {
    updatePendingJobV2(
      Object.assign({}, jobDetails, {
        jobStatus: JobStatus.Error,
        errorMessage:
          'Your browser has informed ArtBot that its storage quota has been exceeded. Please remove some older images and try again shortly.'
      })
    )
    await updatePendingJobInDexie(
      imageDetails.id,
      Object.assign({}, jobDetails, {
        jobStatus: JobStatus.Error,
        errorMessage:
          'Your browser has informed ArtBot that its storage quota has been exceeded. Please remove some older images and try again shortly.'
      })
    )
    return { success: false }
  }

  if (!jobDetails.jobStatus) {
    jobDetails.jobStatus = JobStatus.Waiting
  }

  if (!jobDetails.initWaitTime) {
    jobDetails.initWaitTime = checkJobResult.wait_time
  } else if (
    jobDetails.wait_time &&
    jobDetails.wait_time > jobDetails.initWaitTime
  ) {
    jobDetails.initWaitTime = checkJobResult.wait_time
  }

  if (checkJobResult?.processing === 1) {
    jobDetails.jobStatus = JobStatus.Processing
    jobDetails.wait_time = checkJobResult.wait_time
  } else if (checkJobResult?.waiting === 1) {
    jobDetails.jobStatus = JobStatus.Queued
    jobDetails.wait_time = checkJobResult.wait_time
    jobDetails.queue_position = checkJobResult.queue_position
  }

  jobDetails.is_possible = checkJobResult.is_possible

  updatePendingJobV2(Object.assign({}, jobDetails))
  // await updatePendingJobInDexie(jobDetails.id, Object.assign({}, jobDetails))

  let imgDetailsFromApi: FinishedImageResponse | FinishedImageResponseError
  if ('status' in checkJobResult && checkJobResult.status === 'NOT_FOUND') {
    const jobTimestamp = imageDetails.timestamp / 1000
    const currentTimestamp = Date.now() / 1000

    // Time in seconds. This handles any sort of initial request delay.
    if (currentTimestamp - jobTimestamp > 60) {
      updatePendingJobV2(
        Object.assign({}, jobDetails, {
          jobStatus: JobStatus.Error,
          errorMessage:
            'Job has gone stale and has been removed from the Stable Horde backend. Retry?'
        })
      )
      await updatePendingJobInDexie(
        imageDetails.id,
        Object.assign({}, jobDetails, {
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

  if (checkJobResult?.done) {
    imgDetailsFromApi = await getImage(jobId)

    if (
      'status' in imgDetailsFromApi &&
      imgDetailsFromApi.status === 'WORKER_GENERATION_ERROR'
    ) {
      const jobTimestamp = jobDetails?.timestamp / 1000 || 0
      const currentTimestamp = Date.now() / 1000

      if (currentTimestamp - jobTimestamp > 60) {
        updatePendingJobV2(
          Object.assign({}, jobDetails, {
            jobStatus: JobStatus.Error,
            errorMessage:
              'The worker GPU processing this request encountered an error. Retry?'
          })
        )
        await updatePendingJobInDexie(
          jobDetails.id,
          Object.assign({}, jobDetails, {
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

    if (
      'status' in imgDetailsFromApi &&
      imgDetailsFromApi.status === 'INVALID_IMAGE_FROM_API'
    ) {
      updatePendingJobV2(
        Object.assign({}, imageDetails, {
          jobStatus: JobStatus.Error,
          errorMessage: imgDetailsFromApi.message
        })
      )
      await updatePendingJobInDexie(
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
      imgDetailsFromApi.success &&
      'generations' in imgDetailsFromApi
    ) {
      imageDetails.done = true
      imageDetails.jobStatus = JobStatus.Done
      imageDetails.timestamp = Date.now()

      const job = {
        ...imageDetails,
        ...imgDetailsFromApi
      }

      for (const idx in imgDetailsFromApi.generations) {
        const image = imgDetailsFromApi.generations[idx]
        if ('base64String' in image && image.base64String) {
          if (Number(idx) > 0) {
            // TODO: For now, this is for SDXL_beta logic, which returns an additional image
            addImageToDexie({
              jobId,
              base64String: image.base64String,
              hordeImageId: image.hordeImageId,
              type: 'ab-test'
            })

            return
          }

          const jobWithImageDetails = {
            ...job,
            ...image,
            kudos: imgDetailsFromApi.kudos
          }

          const result = await addCompletedJobToDb({
            jobDetails: jobWithImageDetails
          })

          if (result.success) {
            updatePendingJobV2(
              Object.assign({}, jobWithImageDetails, {
                timestamp: Date.now(),
                jobStatus: JobStatus.Done
              })
            )

            await updatePendingJobInDexie(
              imageDetails.id,
              Object.assign({}, jobWithImageDetails, {
                timestamp: Date.now(),
                jobStatus: JobStatus.Done
              })
            )

            logToConsole({
              data: jobWithImageDetails,
              name: 'imageCache.checkCurrentJob.updatePendingJobAfterComplete.success',
              debugKey: 'ADD_COMPLETED_JOB_TO_DB'
            })
          }
        }
      }

      setNewImageReady(imageDetails.jobId)
      setShowImageReadyToast(true)
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
