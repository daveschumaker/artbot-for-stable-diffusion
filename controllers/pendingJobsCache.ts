import cloneDeep from 'clone-deep'
import { JobStatus } from 'types'
import { allPendingJobs, deletePendingJobFromDb } from 'utils/db'

interface IPendingJob {
  id: number
  jobId?: string | undefined
  errorMessage?: string
}

interface IPendingJobs {
  [key: string]: IPendingJob
}

let pendingJobs: IPendingJobs = {}

// TODO: If people start encountering OOM errors, strip
// base64 image from object on JobStatus.Done and
// do a direct db lookup using the pending image modal.

const DEBUG_PENDING_CACHE = async () => {
  if (typeof window === 'undefined') {
    return
  }

  console.log(`-- pendingJobs cache:`)
  console.log(pendingJobs)

  const jobs = await allPendingJobs()
  console.log(`\n-- pendingJobs IndexedDb table:`)
  console.log(jobs)
}

export const initLoadPendingJobsFromDb = async () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.DEBUG_PENDING_CACHE = DEBUG_PENDING_CACHE
  }

  const jobs = await allPendingJobs()

  // @ts-ignore
  if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
    console.log(`initLoadPendingJobsFromDb`, jobs)
  }

  jobs.forEach((job: any) => {
    pendingJobs[job.jobId] = job
  })
}

export const syncPendingJobsFromDb = async () => {
  const jobs = await allPendingJobs()

  // @ts-ignore
  if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
    console.log(`syncPendingJobsFromDb`, jobs)
  }

  jobs.forEach((job: any) => {
    if (pendingJobs[job.jobId]) {
      return
    }

    pendingJobs[job.jobId] = job
  })
}

export const deletePendingJobs = async (status?: any) => {
  if (status) {
    const jobs = Object.assign({}, pendingJobs)
    for (const [key, value] of Object.entries(jobs)) {
      // @ts-ignore
      if (value.jobStatus === status) {
        delete pendingJobs[key]
      }
    }
  } else {
    // @ts-ignore
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

export const getAllPendingJobs = (status?: any): Array<any> => {
  let jobsArray: Array<IPendingJob> = []
  for (const [, value] of Object.entries(pendingJobs)) {
    jobsArray.push(cloneDeep(value))
  }

  if (status) {
    return jobsArray.filter((job: any) => {
      if (job && job.jobStatus) {
        return job.jobStatus === status
      }
    })
  }

  return jobsArray
}

export const setPendingJob = (pendingJob: IPendingJob) => {
  if (!pendingJob || !pendingJob.jobId) {
    return
  }

  // @ts-ignore
  if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
    console.log(`setPendingJob`, pendingJob)
  }

  const { jobId } = pendingJob
  pendingJobs[jobId] = cloneDeep(pendingJob)
}

// V2 due to method existing in db
export const updatePendingJobV2 = (pendingJob: IPendingJob) => {
  if (!pendingJob || !pendingJob.jobId) {
    return
  }

  const { jobId } = pendingJob

  // @ts-ignore
  if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
    console.log(`updatePendingJobV2`, pendingJob)
  }

  // Fix ghosting issue that could occur when in-progress jobs were deleted.
  if (!pendingJobs[jobId]) {
    return false
  }

  pendingJobs[jobId] = cloneDeep(pendingJob)
}

export const updatePendingJobId = (oldId: string = '', newId: string) => {
  if (!oldId || !newId || !pendingJobs[oldId]) {
    return
  }

  pendingJobs[newId] = cloneDeep(pendingJobs[oldId])

  if (pendingJobs[newId]) {
    pendingJobs[newId].jobId = newId
  }

  delete pendingJobs[oldId]
}

export const updateAllPendingJobsV2 = async (
  status: any,
  options: any = {}
) => {
  if (status) {
    const jobs = Object.assign({}, pendingJobs)
    for (const [key, value = {}] of Object.entries(jobs)) {
      const inProgress =
        // @ts-ignore
        value.jobStatus === JobStatus.Done ||
        // @ts-ignore
        value.jobStatus === JobStatus.Processing ||
        // @ts-ignore
        value.jobStatus === JobStatus.Requested

      if (!inProgress && pendingJobs[key]) {
        // @ts-ignore
        pendingJobs[key].jobStatus = status
        pendingJobs[key].errorMessage = options?.errorMessage
      }
    }
  } else {
    // @ts-ignore
    pendingJobs = {}
  }
}
