import { getApiHostServer } from 'app/_utils/appUtils'

let isPending = false
export const checkInterrogate = async (jobId: string) => {
  if (isPending) {
    return {
      success: false,
      status: 'WAIT_FOR_PENDING_REQUEST',
      message: 'Unable to check image status'
    }
  }

  try {
    isPending = true
    const res = await fetch(
      `${getApiHostServer()}/api/v2/interrogate/status/${jobId}`
    )
    isPending = false
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
