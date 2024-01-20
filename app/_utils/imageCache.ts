import { userInfoStore } from 'app/_store/userStore'
import { checkImageStatus } from 'app/_api/checkImageStatus'
import { getFinishedImage } from 'app/_api/getFinishedImage'
import { trackGaEvent } from 'app/_api/telemetry'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast,
  setStorageQuotaLimit
} from 'app/_store/appStore'
import {
  CheckImage,
  FinishedImageResponse,
  FinishedImageResponseError,
  JobStatus
} from '_types'
import {
  addCompletedJobToDexie,
  deletePendingJobFromDb,
  getImageDetails
} from './db'
import { isAppActive, logError, uuidv4 } from './appUtils'
import { logToConsole } from './debugTools'
import {
  deletePendingJob,
  updatePendingJobV2
} from 'app/_controllers/pendingJobsCache'
import { base64toBlob } from './imageUtils'
import { initBlob, blobToBase64 } from './blobUtils'
import { completedImageJob } from 'app/_controllers/V2/completedImageJobController'

export const initIndexedDb = () => {}

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

export const getImage = async (jobId: string) => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id',
      message: ''
    }
  }

  await completedImageJob(jobId) // TODO: REMOVE ME TEST TEST TEST
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
      imageDetails &&
      imgDetailsFromApi.success &&
      'generations' in imgDetailsFromApi
    ) {
      imageDetails.done = true
      imageDetails.jobStatus = JobStatus.Done
      imageDetails.kudos = imgDetailsFromApi.kudos
      imageDetails.timestamp = Date.now()

      const job = {
        ...imageDetails,
        ...imgDetailsFromApi
      }

      let sdxlCompanionJob
      for (const idx in imgDetailsFromApi.generations) {
        const image = imgDetailsFromApi.generations[idx]
        if ('base64String' in image && image.base64String) {
          initBlob()
          // Insert exif information in the image
          const metaData: string =
            `${job.prompt}\n` +
            (job.negative ? `Negative prompt: ${job.negative}\n` : ``) +
            `Steps: ${job.steps}, Sampler: ${job.sampler}, CFG scale: ${job.cfg_scale}, Seed: ${image.seed}` +
            `, Size: ${job.width}x${job.height}, model: ${job.models}`
          let oldBlob
          try {
            oldBlob = await base64toBlob(image.base64String)
          } catch (err) {
            console.log(
              `Error: Something unfortunate happened when attempting to convert base64string to file blob`
            )
            console.log(err)
            continue
          }
          // @ts-ignore
          let newBlob = await oldBlob?.addOrUpdateExifData(metaData)
          image.base64String = (await blobToBase64(newBlob)).split(',')[1]

          const jobWithImageDetails = {
            ...job,
            ...image
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
