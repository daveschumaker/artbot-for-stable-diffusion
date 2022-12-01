import { getApiHostServer } from '../utils/appUtils'

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
}

let isPending = false
export const checkImageStatus = async (
  jobId: string
): Promise<CheckResponse> => {
  if (isPending || !jobId) {
    return {
      success: false,
      status: 'WAIT_FOR_PENDING_REQUEST',
      message: 'Unable to check image status'
    }
  }

  isPending = true
  try {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/check/${jobId}`
    )

    const statusCode = res.status
    isPending = false
    if (statusCode === 404) {
      return {
        success: false,
        status: 'NOT_FOUND'
      }
    }

    const data = await res.json()

    return {
      success: true,
      ...data
    }
  } catch (err) {
    isPending = false
    return {
      success: false,
      status: 'UNKNOWN_ERROR'
    }
  }
}
