import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

interface HordeGeneration {
  img: string
  seed: string
  id: string
  censored: boolean
  gen_metadata: Array<{
    type: string
    value: string
    ref?: string
  }>
  worker_id: string
  worker_name: string
  model: string
  state: string
}

interface HordeSuccessResponse {
  generations: HordeGeneration[]
  shared: boolean
  finished: number
  processing: number
  restarted: number
  waiting: number
  done: boolean
  faulted: boolean
  wait_time: number
  queue_position: number
  kudos: number
  is_possible: boolean
}

interface HordeErrorResponse {
  message: string
}

export interface StatusSuccessResponse extends HordeSuccessResponse {
  success: boolean
}

export interface StatusErrorResponse extends HordeErrorResponse {
  success: boolean
  statusCode: number
}

export default async function status(
  jobId: string
): Promise<StatusSuccessResponse | StatusErrorResponse> {
  let statusCode

  try {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/status/${jobId}`,
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

    if ('done' in data) {
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        statusCode,
        ...data
      }
    }
  } catch (err) {
    console.log(`Error: Unable to download images for jobId: ${jobId}`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      message: 'unknown error'
    }
  }
}
