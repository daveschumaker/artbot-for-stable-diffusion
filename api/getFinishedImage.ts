import { clientHeader, getApiHostServer } from '../utils/appUtils'
import { blobToBase64 } from '../utils/helperUtils'
import { isValidHttpUrl } from '../utils/validationUtils'

interface FinishedImageResponse {
  success: boolean
  status?: string
  jobId?: string
  worker_name?: string
  hordeImageId?: string
  base64String?: string
  seed?: string
  canRate?: boolean
  model?: string
  worker_id?: string
}

let isPending = false

const apiCooldown = () => {
  isPending = true

  setTimeout(() => {
    isPending = false
  }, 31000)
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
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    const data = await res.json()
    const { generations, message, shared } = data

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
      const { model, seed, id: hordeImageId, worker_id, worker_name } = image
      let base64String = image.img

      // Image is not done uploading to R2 yet(?).
      // This should no longer happen, according to Db0
      // Keeping this here for now.
      if (image.img === 'R2') {
        apiCooldown()
        return {
          success: false,
          status: 'WAITING_FOR_PENDING_REQUEST'
        }
      }

      if (isValidHttpUrl(image.img)) {
        try {
          const imageData = await fetch(`${image.img}`)
          const blob = await imageData.blob()
          const imageEncodedString = await blobToBase64(blob)
          const [, extractedBase64String] =
            // @ts-ignore
            imageEncodedString?.split('data:image/webp;base64,') || ['', '']

          base64String = extractedBase64String
        } catch (err) {
          return {
            success: false,
            status: 'MISSING_BASE64_STRING'
          }
        }
      }

      if (!base64String) {
        return {
          success: false,
          status: 'MISSING_BASE64_STRING'
        }
      }

      return {
        success: true,
        hordeImageId,
        jobId,
        model,
        base64String,
        seed,
        canRate: shared ? true : false,
        worker_id,
        worker_name
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
