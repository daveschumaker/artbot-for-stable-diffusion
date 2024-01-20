import check, { CheckSuccessResponse } from 'app/_api/horde/check'
import { getPendingJob, updatePendingJobV2 } from '../pendingJobsCache'
import { JobStatus } from '_types'

// TODO: Consideration.
// Say a user is in the middle of an image generation and they are able to download a few images.
// Then they close their browser and come back. What happens? Job will be stale and give an error.
// We should check if the job 404s or has some sort of error, but if we already have images saved
// in IndexedDb, we just alert them to that, and their generations are saved.

// There were a number of issues around the AI Horde getting too many 404s
// from ArtBot. Something is happening where jobs aren't being removed
// from the queue. This hack helps mitigate that.
const hacky404JobCheck: { [key: string]: boolean } = {}

export const checkImageJob = async (jobId: string) => {
  const job = getPendingJob(jobId)

  if (hacky404JobCheck[jobId]) {
    return false
  }

  // The only thing that can set JobState.Done is the
  // completedImageJobController. So, if that has happened,
  // this no longer needs to do anything and can skip it.
  if (job.jobStatus === JobStatus.Done) {
    hacky404JobCheck[jobId] = true
    return false
  }

  const data = await check(jobId)

  if (data.success) {
    const successData = data as CheckSuccessResponse

    job.done = successData.done
    job.finished = successData.finished
    job.is_possible = successData.is_possible
    job.processing = successData.processing
    job.queue_position = successData.queue_position
    job.wait_time = successData.wait_time
    job.waiting = successData.waiting

    if (job.initWaitTime === null) {
      job.initWaitTime = successData.wait_time
    }

    if (successData.processing > 0) {
      job.jobStatus = JobStatus.Processing
    }

    if (successData.faulted) {
      job.jobStatus = JobStatus.Error
      job.errorMessage =
        'An unknown error occurred while checking pending image job.'
    }

    await updatePendingJobV2(Object.assign({}, job))

    // TODO: Handle "done" state and / or check for existing completed images from within the batch.
  }

  if (!data.success && 'statusCode' in data) {
    if (data.statusCode === 404) {
      hacky404JobCheck[jobId] = true

      await updatePendingJobV2(
        Object.assign({}, job, {
          errorMessage:
            'Job has gone stale and has been removed from the AI Horde backend. Retry?',
          errorStatus: 'NOT_FOUND',
          jobStatus: JobStatus.Error
        })
      )
    }
  }
}
