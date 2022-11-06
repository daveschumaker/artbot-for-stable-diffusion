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
      `https://stablehorde.net/api/v2/generate/status/${jobId}`,
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
      const { img: base64String, model, seed, worker_id } = image

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
