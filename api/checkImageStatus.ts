import memoizee from 'memoizee'
import { clientHeader, getApiHostServer } from '../utils/appUtils'

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

let isCoolingOff = false

const apiCooldown = () => {
  if (isCoolingOff) {
    return
  }

  isCoolingOff = true

  setTimeout(() => {
    isCoolingOff = false
  }, 10000)
}

export const _checkImageStatus = async (
  jobId: string
): Promise<CheckResponse> => {
  if (isCoolingOff) {
    return {
      success: false,
      status: 'WAIT_FOR_PENDING_REQUEST',
      message: 'Unable to check image status',
      jobId
    }
  }

  try {
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
      return {
        success: false,
        status: 'NOT_FOUND',
        jobId
      }
    }

    if (statusCode === 429) {
      apiCooldown()
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
export const checkImageStatus = memoizee(_checkImageStatus, {
  maxAge: 5000
})
