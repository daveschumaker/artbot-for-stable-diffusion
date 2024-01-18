import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

interface HordeSuccessResponse {
  done: boolean
  faulted: boolean
  finished: number
  is_possible: boolean
  kudos: number
  processing: number
  queue_position: number
  restarted: number
  wait_time: number
  waiting: number
}

interface HordeErrorResponse {
  message: string
}

export interface CheckSuccessResponse extends HordeSuccessResponse {
  success: boolean
}

export interface CheckErrorResponse extends HordeErrorResponse {
  success: boolean
  statusCode: number
}

export default async function check(jobId: string) {
  let statusCode
  try {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/check/${jobId}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    statusCode = res.status
    const data: HordeSuccessResponse | HordeErrorResponse = await res.json()

    if ('done' in data && 'is_possible' in data) {
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        message: data.message,
        statusCode
      }
    }
  } catch (err) {
    console.log(`Error: Unable to check status for jobId: ${jobId}`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      message: 'unknown error'
    }
  }
}
