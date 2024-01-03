import { appInfoStore } from 'app/_store/appStore'
import { JobStatus } from '_types'
import { isAppActive } from 'app/_utils/appUtils'
import { checkCurrentJob, sendJobToApi } from 'app/_utils/imageCache'
import { sleep } from 'app/_utils/sleep'
import {
  MAX_CONCURRENT_JOBS_ANON,
  MAX_CONCURRENT_JOBS_USER,
  POLL_COMPLETED_JOBS_INTERVAL
} from '_constants'
import { getAllPendingJobs } from './pendingJobsCache'
import AppSettings from 'app/_data-models/AppSettings'
import { userInfoStore } from 'app/_store/userStore'

const MAX_JOBS = userInfoStore.state.loggedIn
  ? MAX_CONCURRENT_JOBS_USER
  : MAX_CONCURRENT_JOBS_ANON

let pendingJobs: any = []
let enableDebugLogs = false

let isAppCurrentlyActive = isAppActive()

const logDebug = (message: string, obj?: any) => {
  if (enableDebugLogs) {
    if (obj) {
      console.log(`pendingJobsController: ${message}`)
      console.log(obj)
    } else {
      console.log(`pendingJobsController: ${message}`)
    }
  }
}

const getProcessingOrQueuedJobs = (jobs: any[]): any[] => {
  return jobs.filter((job: any) =>
    [JobStatus.Queued, JobStatus.Processing].includes(job.jobStatus)
  )
}

export const getPendingJobsFromCache = () => [...pendingJobs]

export const fetchPendingImageJobs = async () => {
  pendingJobs = [...getAllPendingJobs()]
}

export const checkMultiPendingJobs = async () => {
  if (
    typeof window === 'undefined' ||
    pendingJobs.length === 0 ||
    !isAppCurrentlyActive
  ) {
    return
  }

  const processingOrQueued = getProcessingOrQueuedJobs(pendingJobs)
  const limitCheck = processingOrQueued.slice(-MAX_JOBS)

  for (const jobDetails of limitCheck) {
    await checkCurrentJob(jobDetails)
    await sleep(300)
  }
}

export const createImageJobs = async () => {
  if (typeof window === 'undefined' || pendingJobs.length === 0) {
    return
  }

  if (appInfoStore.state.storageQuotaLimit) {
    logDebug(`Unable to request image. Storage Quota limit is full.`)
    return
  }

  if (!isAppCurrentlyActive) {
    logDebug(`App is not active`)
    return
  }

  if (AppSettings.get('pauseJobQueue')) {
    logDebug(`job queue paused`)
    return
  }

  const processingOrQueued = getProcessingOrQueuedJobs(pendingJobs)
  logDebug(`createImageJobs / processingOrQueued:`, processingOrQueued)

  if (processingOrQueued.length < MAX_JOBS) {
    const [jobOne, jobTwo] = pendingJobs.filter(
      (job: any) => job.jobStatus === JobStatus.Waiting
    )

    if (jobOne) {
      await sendJobToApi(jobOne)
    }

    if (jobTwo) {
      await sendJobToApi(jobTwo)
    }

    await fetchPendingImageJobs()
  }
}

export const updatePendingJobs = async () => {
  await fetchPendingImageJobs()
  await sleep(100)
  while (true) {
    await fetchPendingImageJobs()
    await sleep(100)
  }
}

export const createPendingJobInterval = async () => {
  await fetchPendingImageJobs()
  createImageJobs()
  await sleep(1100)

  while (true) {
    await fetchPendingImageJobs()
    createImageJobs()
    await sleep(1100)
  }
}

export const pendingJobCheckInterval = async () => {
  while (true) {
    await checkMultiPendingJobs()
    await sleep(POLL_COMPLETED_JOBS_INTERVAL)
  }
}

export const initPendingJobService = () => {
  updatePendingJobs()
  pendingJobCheckInterval()
  createPendingJobInterval()
}

const toggleLogs = () => {
  enableDebugLogs = !enableDebugLogs
}

const initWindow = () => {
  if (typeof window !== 'undefined') {
    if (!window._artbot) window._artbot = {}
    window._artbot.getAllPendingJobsFromController = getAllPendingJobs
    window._artbot.togglePendingJobsControllerLogs = toggleLogs

    window.addEventListener('focus', function () {
      isAppCurrentlyActive = true
    })

    setInterval(() => {
      isAppCurrentlyActive = isAppActive()
    }, 10000)
  }
}

initWindow()
