import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

interface CheckResponse {
  success: boolean
  message?: string
  status?: string
  finished?: number
  processing?: number
  waiting?: number
  done?: boolean
  faulted?: boolean
  wait_time?: number
  queue_position?: number
  jobId: string
}

interface HackyJobCheck {
  [key: string]: boolean
}

// There have been a whole bunch of issues around AI Horde getting too many 404 errors from ArtBot.
// Something is happening where jobs aren't being removed from the queue.
// This hack will hopefully mitigate that.
const hacky404JobCheck: HackyJobCheck = {}

// NOTE TO SELF: DO NOT MEMOIZE THIS API CALL. BAD THINGS HAPPEN.
// e.g., queuing up 1,000 image requests at once. FUN!
export const checkImageStatus = async (
  jobId: string
): Promise<CheckResponse> => {
  try {
    if (hacky404JobCheck[jobId]) {
      return {
        success: false,
        status: 'NOT_FOUND',
        message:
          'Job has gone stale and has been removed from the Stable Horde backend. Retry?',
        jobId
      }
    }

    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/check/${jobId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    const statusCode = res.status
    if (statusCode === 404) {
      hacky404JobCheck[jobId] = true

      return {
        success: false,
        status: 'NOT_FOUND',
        message:
          'Job has gone stale and has been removed from the Stable Horde backend. Retry?',
        jobId
      }
    }

    if (statusCode === 429) {
      return {
        success: false,
        status: 'WAITING_FOR_PENDING_REQUEST',
        jobId
      }
    }

    const data = await res.json()

    return {
      success: true,
      ...data
    }
  } catch (err) {
    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      jobId
    }
  }
}
