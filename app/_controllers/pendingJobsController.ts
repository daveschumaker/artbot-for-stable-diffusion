import { appInfoStore } from 'app/_store/appStore'
import { JobStatus } from '_types'
import { isAppActive } from 'app/_utils/appUtils'
import { sleep } from 'app/_utils/sleep'
import {
  MAX_CONCURRENT_JOBS_ANON,
  MAX_CONCURRENT_JOBS_USER,
  POLL_COMPLETED_JOBS_INTERVAL
} from '_constants'
import { getAllPendingJobs, getJobsInProgress } from './pendingJobsCache'
import AppSettings from 'app/_data-models/AppSettings'
import { userInfoStore } from 'app/_store/userStore'
import { createImageJob } from './V2/createImageJobController'
import { checkImageJob } from './V2/checkImageJobController'
import { completedImageJob } from './V2/completedImageJobController'

const MAX_JOBS = userInfoStore.state.loggedIn
  ? MAX_CONCURRENT_JOBS_USER
  : MAX_CONCURRENT_JOBS_ANON

let pendingJobs: any = []

let isAppCurrentlyActive = isAppActive()

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

  const processingOrQueued = getJobsInProgress()
  const limitCheck = processingOrQueued.slice(-MAX_JOBS)

  for (const jobDetails of limitCheck) {
    await checkImageJob(jobDetails.jobId)

    // Out with the old...
    // await checkCurrentJob(jobDetails)
    await sleep(300)

    // TODO: Use a Promise.all function to check all jobs at the same time.
  }
}

export const checkFinishedImages = async () => {
  const processingOrQueued = getJobsInProgress()
  const limitCheck = processingOrQueued.slice(-MAX_JOBS)

  for (const jobDetails of limitCheck) {
    if (jobDetails.finished > 0) {
      await completedImageJob(jobDetails.jobId)
    }
  }
}

export const createImageJobs = async () => {
  if (typeof window === 'undefined' || pendingJobs.length === 0) {
    return
  }

  if (appInfoStore.state.storageQuotaLimit) {
    return
  }

  if (!isAppCurrentlyActive) {
    return
  }

  if (AppSettings.get('pauseJobQueue')) {
    return
  }

  const processingOrQueued = getJobsInProgress()

  if (processingOrQueued.length < MAX_JOBS) {
    const [jobOne, jobTwo] = pendingJobs.filter(
      (job: any) => job.jobStatus === JobStatus.Waiting
    )

    if (jobOne) {
      await createImageJob(jobOne)
    }

    if (jobTwo) {
      await createImageJob(jobTwo)
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

export const checkFinishedImageInterval = async () => {
  while (true) {
    await checkFinishedImages()
    await sleep(8000)
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
  checkFinishedImageInterval()
  createPendingJobInterval()
}

const initWindow = () => {
  if (typeof window !== 'undefined') {
    if (!window._artbot) window._artbot = {}
    window._artbot.getAllPendingJobsFromController = getAllPendingJobs

    window.addEventListener('focus', function () {
      isAppCurrentlyActive = true
    })

    setInterval(() => {
      isAppCurrentlyActive = isAppActive()
    }, 10000)
  }
}

initWindow()
