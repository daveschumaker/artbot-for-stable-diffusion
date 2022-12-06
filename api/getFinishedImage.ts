import AppSettings from '../models/AppSettings'
import { getApiHostServer } from '../utils/appUtils'

interface FinishedImageResponse {
  success: boolean
  status?: string
  jobId?: string
  base64String?: string
  seed?: string
  model?: string
  worker_id?: string
}

let isPending = false

const apiCooldown = () => {
  setTimeout(() => {
    isPending = false
  }, 61000)
}

export const getFinishedImage = async (
  jobId: string
): Promise<FinishedImageResponse> => {
  if (isPending) {
    return {
      success: false,
      status: 'HAS_PENDING_JOB'
    }
  }

  if (!jobId) {
    return {
      success: false,
      status: 'MISSING_JOBID'
    }
  }

  isPending = true

  try {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/status/${jobId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await res.json()
    const { generations, message } = data

    if (message === '2 per 1 minute') {
      apiCooldown()
      return {
        success: false,
        status: 'WAITING_FOR_PENDING_REQUEST'
      }
    }

    isPending = false
    if (Array.isArray(generations)) {
      const [image] = generations
      const { model, seed, worker_id } = image
      let base64String = image.img

      if (AppSettings.get('useR2')) {
        const resp = await fetch(`/artbot/api/img-from-url`, {
          method: 'POST',
          body: JSON.stringify({
            imageUrl: base64String,
            r2: true
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await resp.json()

        // @ts-ignore
        base64String = data.imgBase64String
      }

      if (!base64String) {
        return {
          success: false,
          status: 'MISSING_BASE64_STRING'
        }
      }

      return {
        success: true,
        jobId,
        model,
        base64String,
        seed,
        worker_id
      }
    }

    return {
      success: false,
      status: 'UNKNOWN_ERROR'
    }
  } catch (err) {
    return {
      success: false,
      status: 'UNKNOWN_ERROR'
    }
  }
}
