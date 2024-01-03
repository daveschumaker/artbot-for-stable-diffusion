import { JobStatus } from '_types'
import { sleep } from 'app/_utils/sleep'
import { MAX_CONCURRENT_JOBS_ANON, MAX_CONCURRENT_JOBS_USER } from '_constants'
import { userInfoStore } from 'app/_store/userStore'
import {
  addCompletedJobToDexie,
  allPendingJobs,
  getPendingJobDetails,
  updatePendingJobInDexieByJobId
} from 'app/_utils/db'
import { createImage } from 'app/_api/createImage'
import { checkImageStatus } from 'app/_api/checkImageStatus'
import { getFinishedImage } from 'app/_api/getFinishedImage'
import { blobToBase64, initBlob } from 'app/_utils/blobUtils'
import { base64toBlob } from 'app/_utils/imageUtils'
import { isAppActive } from 'app/_utils/appUtils'
import { setNewImageReady } from 'app/_store/appStore'

interface ResolvedPromise {
  value: any
}

let MAX_JOBS = userInfoStore.state.loggedIn
  ? MAX_CONCURRENT_JOBS_USER
  : MAX_CONCURRENT_JOBS_ANON

let isAppCurrentlyActive = isAppActive()

export const initPendingJobService = () => {
  newJobCheckInterval()
  pendingJobCheckInterval()
}

export const newJobCheckInterval = async () => {
  while (true) {
    if (!isAppCurrentlyActive) return

    await checkNewJobs()
    await sleep(1050)
  }
}

export const pendingJobCheckInterval = async () => {
  while (true) {
    if (!isAppCurrentlyActive) return

    await checkJobsOnHorde()
    await sleep(1000)
  }
}

const checkNewJobs = async () => {
  let queued: any[] | null = (await allPendingJobs(JobStatus.Queued)) || []
  let processing: any[] | null =
    (await allPendingJobs(JobStatus.Processing)) || []

  const pendingJobs = [...queued, ...processing]

  if (pendingJobs.length >= MAX_JOBS) {
    return
  }

  let waitingJobs: any[] | null =
    (await allPendingJobs(JobStatus.Waiting)) || []
  const [jobOne, jobTwo] = waitingJobs

  if (jobOne) {
    await createJob(jobOne)
  }

  if (jobTwo) {
    await createJob(jobTwo)
  }

  // Garbage collections
  // @ts-ignore
  waitingJobs = null
  queued = null
  processing = null
}

const createJob = async (job: any) => {
  await updatePendingJobInDexieByJobId(job.jobId, {
    jobStatus: JobStatus.Requested
  })

  const data = await createImage(job as any)

  if (data.success) {
    await updatePendingJobInDexieByJobId(job.jobId, {
      jobId: data.jobId,
      jobStatus: JobStatus.Queued
    })
  }
}

export const checkJobsOnHorde = async () => {
  let queued: any[] | null = (await allPendingJobs(JobStatus.Queued)) || []
  let processing: any[] | null =
    (await allPendingJobs(JobStatus.Processing)) || []

  const pendingJobs: any[] = [...queued, ...processing]

  if (pendingJobs.length > 0) {
    try {
      const checkStatusPromises = pendingJobs.map((job) =>
        checkImageStatus(job.jobId)
      )

      // Wait for all the API calls to resolve
      let results = await Promise.allSettled(checkStatusPromises)

      for (const [i, result] of results.entries()) {
        const { value } = result as ResolvedPromise
        const {
          finished,
          message,
          processing,
          queue_position,
          success,
          wait_time,
          waiting
        } = value

        try {
          if (!success) {
            await updatePendingJobInDexieByJobId(pendingJobs[i].jobId, {
              jobStatus: JobStatus.Error,
              errorMessage: message
            })
            return
          } else if (waiting === 1) {
            await updatePendingJobInDexieByJobId(pendingJobs[i].jobId, {
              jobStatus: JobStatus.Queued,
              wait_time,
              queue_position
            })
          } else if (processing === 1) {
            await updatePendingJobInDexieByJobId(pendingJobs[i].jobId, {
              jobStatus: JobStatus.Processing,
              wait_time,
              queue_position
            })
          } else if (finished === 1) {
            await handleFinishedJob(pendingJobs[i].jobId)
          }
        } catch (error) {
          console.error(
            'Error updating image status for',
            pendingJobs[i].jobId,
            error
          )
        }
      }

      // Garbage collections
      // @ts-ignore
      results = null
      queued = null
      processing = null
    } catch (err) {}
  }
}

const handleFinishedJob = async (jobId: string) => {
  try {
    const imgDetailsFromApi = await getFinishedImage(jobId)
    const success =
      imgDetailsFromApi &&
      imgDetailsFromApi.success &&
      'generations' in imgDetailsFromApi

    if (!success) {
      await updatePendingJobInDexieByJobId(jobId, {
        jobStatus: JobStatus.Error,
        // @ts-ignore
        errorMessage: imgDetailsFromApi.message
      })
    } else if (success) {
      const imageDetails = await getPendingJobDetails(jobId)
      const updateObject = {
        done: true,
        jobStatus: JobStatus.Done,
        kudos: imgDetailsFromApi.kudos,
        timestamp: Date.now()
      }

      for (const idx in imgDetailsFromApi.generations) {
        const image = imgDetailsFromApi.generations[idx]
        if ('base64String' in image && image.base64String) {
          initBlob()

          // Insert exif information in the image
          const metaData: string =
            `${imageDetails.prompt}\n` +
            (imageDetails.negative
              ? `Negative prompt: ${imageDetails.negative}\n`
              : ``) +
            `Steps: ${imageDetails.steps}, Sampler: ${imageDetails.sampler}, CFG scale: ${imageDetails.cfg_scale}, Seed: ${image.seed}` +
            `, Size: ${imageDetails.width}x${imageDetails.height}, model: ${imageDetails.models}`
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
            ...imageDetails,
            ...updateObject,
            ...image
          }

          await addCompletedJobToDexie({
            ...jobWithImageDetails
          })
          setNewImageReady(jobId)
        }
      }
    } else {
      console.log(`\n\n---`)
      console.log(`Error encountered???`)
      console.log(`imgDetailsFromApi`, imgDetailsFromApi)
      throw new Error('Something unfortunate happened.')
    }
  } catch (err) {
    console.log(`Error:`, err)
  }
}
