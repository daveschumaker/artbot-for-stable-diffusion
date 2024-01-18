import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { updatePendingJobId, updatePendingJobV2 } from '../pendingJobsCache'
import { JobStatus } from '_types'
import generate, {
  GenerateErrorResponse,
  GenerateSuccessResponse
} from 'app/_api/horde/generate'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'

export const createImageJob = async (job: CreateImageRequest) => {
  await updatePendingJobV2(
    Object.assign({}, job, { jobStatus: JobStatus.Requested })
  )

  const imageParams = new ImageParamsForApi(job)
  const data: GenerateSuccessResponse | GenerateErrorResponse =
    await generate(imageParams)

  if ('id' in data) {
    await updatePendingJobV2(
      Object.assign({}, job, { jobStatus: JobStatus.Queued })
    )

    // After receiving successful response for AI Horde,
    // update ArtBot's internal jobId with jobId returned
    // from the Horde. This new id will be used to check
    // periodically check status of pending jobs on the Horde.
    await updatePendingJobId(job.jobId, data.id)
  }

  // Handle all sorts of image generation errors
  const hasError = !data.success && 'message' in data
  if (hasError) {
    let errorStatus = 'UNKNOWN_ERROR'

    if (data.message.toLowerCase().indexOf('only trusted users')) {
      errorStatus = 'UNTRUSTED_IP'
      data.message =
        'Cannot send requests from an IP address behind a VPN or Private Relay. Please disable and try again.'
    }

    if (data.statusCode === 400) {
      errorStatus = 'INVALID_PARAMS'
    }

    if (data.statusCode === 401) {
      errorStatus = 'INVALID_API_KEY'
    }

    if (data.statusCode === 403) {
      errorStatus = 'FORBIDDEN_REQUEST'
    }

    if (data.statusCode === 429) {
      errorStatus = 'MAX_REQUEST_LIMIT'
    }

    if (data.statusCode === 503) {
      errorStatus = 'HORDE_OFFLINE'
    }

    if (errorStatus === 'UNKNOWN_ERROR') {
      console.log(`Unknown error occurred in createImageJobController`)
      console.log(data.message)
      data.message = 'Unable to create image. Please try again soon.'
    }

    await updatePendingJobV2(
      Object.assign({}, job, {
        errorMessage: data.message,
        errorStatus,
        jobStatus: JobStatus.Error
      })
    )
  }
}
