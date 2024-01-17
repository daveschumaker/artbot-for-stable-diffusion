/**
 * pendingJobsCache
 *
 * The purpose of this cache is to do an initial fetch of pending jobs data
 * from IndexedDb and then store all subsequent changes in browser memory
 * for quicker look ups and access.
 *
 * Otherwise, having components such as the PendingItems page and panels
 * fetch pending data from IndexedDb becomes very slow and eventually
 * causes the page to crash due to OOM errors.
 */

import cloneDeep from 'clone-deep'
import { JobStatus } from '_types'
import {
  allPendingJobs,
  deletePendingJobFromDb,
  updatePendingJobInDexie
} from 'app/_utils/db'

declare global {
  interface Window {
    DEBUG_PENDING_JOBS?: boolean
  }
}

interface IPendingJob {
  id: number
  jobId?: string | undefined
  errorMessage?: string
  jobStatus: JobStatus
}

interface IPendingJobs {
  [key: string]: IPendingJob
}

let pendingJobs: IPendingJobs = {}

const logDebug = (message: string, obj?: any) => {
  if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
    if (obj) {
      console.log(`pendingJobsCache: ${message}`)
      console.log(obj)
    } else {
      console.log(`pendingJobsCache: ${message}`)
    }
  }
}

const DEBUG_PENDING_CACHE = async () => {
  if (typeof window === 'undefined') {
    return
  }

  const jobs = await allPendingJobs()
  console.log('\n-- pendingJobs IndexedDb table:')
  console.log(jobs)

  logDebug('-- pendingJobs cache', pendingJobs)
  logDebug('-- pendingJobs IndexedDb table', jobs)
}

export const initLoadPendingJobsFromDb = async () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.DEBUG_PENDING_CACHE = DEBUG_PENDING_CACHE
  }

  const jobs = await allPendingJobs()
  logDebug('initLoadPendingJobsFromDb', jobs)

  jobs.forEach((job: any) => {
    pendingJobs[job.jobId] = job
  })
}

export const syncPendingJobsFromDb = async () => {
  const jobs = await allPendingJobs()
  logDebug('syncPendingJobsFromDb', jobs)

  jobs.forEach((job: any) => {
    if (!pendingJobs[job.jobId]) {
      pendingJobs[job.jobId] = job
    }
  })
}

export const deletePendingJobs = async (status?: any) => {
  if (status) {
    const jobs = { ...pendingJobs }
    for (const key in jobs) {
      if (jobs[key]?.jobStatus === status) {
        delete pendingJobs[key]
      }
    }
  } else {
    pendingJobs = {}
  }
}

export const deletePendingJob = async (jobId: string) => {
  delete pendingJobs[jobId]
  deletePendingJobFromDb(jobId)
}

export const getPendingJob = (jobId: string) => {
  return cloneDeep(pendingJobs[jobId])
}

export const getAllPendingJobs = (status?: JobStatus): Array<any> => {
  const jobsArray = Object.values(pendingJobs).map((job) => cloneDeep(job))

  if (status) {
    return jobsArray.filter((job) => job?.jobStatus === status)
  }

  return jobsArray
}

export const setPendingJob = (pendingJob: IPendingJob) => {
  if (!pendingJob || !pendingJob.jobId) {
    return
  }

  logDebug('setPendingJob', pendingJob)
  const { jobId } = pendingJob
  pendingJobs[jobId] = cloneDeep(pendingJob)
}

// Handles updating jobId in both database and in-memory cache.
export const updatePendingJobV2 = (pendingJob: IPendingJob) => {
  if (!pendingJob || !pendingJob.jobId) {
    return
  }

  const { jobId } = pendingJob
  logDebug('updatePendingJobV2', pendingJob)

  if (pendingJobs[jobId]) {
    pendingJobs[jobId] = cloneDeep(pendingJob)

    updatePendingJobInDexie(pendingJob.id, Object.assign({}, pendingJob))
  }
}

export const updatePendingJobProperties = (
  jobId: string,
  updateObject = {}
) => {
  if (pendingJobs[jobId]) {
    const updated = { ...pendingJobs[jobId], ...updateObject }
    pendingJobs[jobId] = cloneDeep(updated)
  }
}

export const updatePendingJobId = (oldId: string = '', newId: string) => {
  if (oldId && newId && pendingJobs[oldId]) {
    pendingJobs[newId] = cloneDeep(pendingJobs[oldId])
    pendingJobs[newId].jobId = newId
    delete pendingJobs[oldId]
  }
}

export const updateAllPendingJobsV2 = async (
  status: any,
  options: any = {}
) => {
  if (status) {
    for (const key in pendingJobs) {
      if (!pendingJobs[key]) continue
      const inProgress =
        pendingJobs[key].jobStatus === JobStatus.Done ||
        pendingJobs[key].jobStatus === JobStatus.Processing ||
        pendingJobs[key].jobStatus === JobStatus.Requested

      if (!inProgress) {
        pendingJobs[key].jobStatus = status
        pendingJobs[key].errorMessage = options?.errorMessage
      }
    }
  } else {
    pendingJobs = {}
  }
}

const initWindow = () => {
  if (typeof window !== 'undefined') {
    if (!window._artbot) window._artbot = {}
    window._artbot.getAllPendingJobs = getAllPendingJobs
  }
}

initWindow()
