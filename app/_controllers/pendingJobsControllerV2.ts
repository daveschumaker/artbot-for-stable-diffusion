import { JobStatus } from '_types/artbot'
import { checkImageStatus } from 'app/_api/checkImageStatus'
import { createImage } from 'app/_api/createImage'
import { fetchImageDetails, updateImageStatus } from 'app/_db/pending'
import { sleep } from 'app/_utils/sleep'

export const initPendingJobServiceV2 = () => {
  newJobCheckInterval()
  pendingJobCheckInterval()
}

export const newJobCheckInterval = async () => {
  while (true) {
    await checkNewJobs()
    await sleep(2500)
  }
}

export const pendingJobCheckInterval = async () => {
  while (true) {
    await checkJobsOnHorde()
    await sleep(4000)
  }
}

const checkJobsOnHorde = async () => {
  const queued = (await fetchImageDetails(JobStatus.Queued)) || []
  const processing = (await fetchImageDetails(JobStatus.Processing)) || []

  const pendingJobs = [...queued, ...processing]

  if (pendingJobs.length > 0) {
    try {
      // Map each job to a promise created by the CallApi method
      const checkStatusPromises = pendingJobs.map((job) =>
        checkImageStatus(job.jobId)
      )

      // Wait for all the API calls to resolve
      const results = await Promise.allSettled(checkStatusPromises)

      // Process results here
      for (const [i, result] of results.entries()) {
        const { value } = result
        const { waiting, wait_time, queue_position, processing, finished } =
          value
        try {
          if (waiting === 1) {
            await updateImageStatus({
              jobId: pendingJobs[i].jobId,
              status: JobStatus.Queued,
              init_wait_time:
                pendingJobs[i].status === JobStatus.Requested ||
                pendingJobs[i].status === JobStatus.Waiting
                  ? wait_time
                  : null,
              wait_time,
              queue_position
            })
          } else if (processing === 1) {
            await updateImageStatus({
              jobId: pendingJobs[i].jobId,
              status: JobStatus.Processing,
              wait_time,
              queue_position
            })
          } else if (finished === 1) {
            // TODO: FIX ME!
            await updateImageStatus({
              jobId: pendingJobs[i].jobId,
              status: JobStatus.Done
            })
          }
        } catch (error) {
          // Handle any errors from updateImageStatus
          console.error(
            'Error updating image status for',
            pendingJobs[i].jobId,
            error
          )
        }

        console.log(`result: ${pendingJobs[i].jobId}`, result)
      }
    } catch (error) {
      // Handle errors here
      console.error('Error checking job statuses:', error)
    }
  }
}

const checkNewJobs = async () => {
  const waitingJobs = (await fetchImageDetails(JobStatus.Waiting)) || []
  const [newJob] = waitingJobs

  console.log(`new job?`, newJob)
  if (newJob) {
    await createJob(newJob)
  }
}

const createJob = async (job) => {
  await updateImageStatus({
    jobId: job.jobId,
    status: JobStatus.Requested
  })

  const data = await createImage(job)

  if (data.success) {
    await updateImageStatus({
      jobId: job.jobId,
      status: JobStatus.Queued,
      updateJobId: data.jobId
    })
  }
}
