import { GenerateResponse, ModelDetails } from '../types'

interface CreateImageResponse {
  success: boolean
  jobId?: string
  status?: string
  message?: string
}

interface ImageDetails {
  prompt: string
  sampler: string
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  models: Array<ModelDetails>
  source_image?: string
  denoising_strength?: number
}

interface ApiParams {
  prompt: string
  params: ParamsObject
  nsfw: boolean
  trusted_workers: boolean
  models: Array<string>
  source_image?: string
}

interface ParamsObject {
  sampler_name: string
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  denoising_strength?: number
}

const toBool = (value?: string | null) => {
  if (value === 'true' || value === 'True') {
    return true
  } else {
    return false
  }
}

const mapImageDetailsToApi = (imageDetails: ImageDetails) => {
  const useTrusted = toBool(localStorage.getItem('useTrusted'))
  const allowNsfw = toBool(localStorage.getItem('allowNsfwImages'))

  const {
    prompt,
    sampler,
    cfg_scale,
    height,
    width,
    seed,
    steps,
    models,
    source_image,
    denoising_strength
  } = imageDetails

  const apiParams: ApiParams = {
    prompt,
    params: {
      sampler_name: sampler,
      cfg_scale: Number(cfg_scale),
      height: Number(height),
      width: Number(width),
      steps: Number(steps)
    },
    nsfw: allowNsfw,
    trusted_workers: useTrusted,
    models: [models[0].name]
  }

  if (seed) {
    apiParams.params.seed = seed
  }

  if (source_image && denoising_strength) {
    apiParams.params.denoising_strength = Number(denoising_strength)
    apiParams.source_image = source_image
  }

  return apiParams
}

let isPending = false

const apiCooldown = () => {
  setTimeout(() => {
    isPending = false
  }, 30000)
}

export const createImage = async (
  imageDetails: ImageDetails
): Promise<CreateImageResponse> => {
  const apikey = localStorage.getItem('apikey')?.trim() || '0000000000'

  if (!apikey || isPending) {
    return {
      success: false
    }
  }

  isPending = true
  const imageParams = mapImageDetailsToApi(imageDetails)

  try {
    const resp = await fetch(`https://stablehorde.net/api/v2/generate/async`, {
      method: 'POST',
      body: JSON.stringify(imageParams),
      headers: {
        'Content-Type': 'application/json',
        apikey: apikey
      }
    })

    const statusCode = resp.status

    if (statusCode === 400) {
      apiCooldown()
      return {
        success: false,
        status: 'INVALID_PARAMS'
      }
    }

    if (statusCode === 401) {
      apiCooldown()
      return {
        success: false,
        status: 'INVALID_API_KEY'
      }
    }

    if (statusCode === 429) {
      apiCooldown()
      return {
        success: false,
        status: 'MAX_REQUEST_LIMIT'
      }
    }

    if (statusCode === 503) {
      apiCooldown()
      return {
        success: false,
        status: 'HORDE_OFFLINE'
      }
    }

    const data = await resp.json()
    const { id, message = '' }: GenerateResponse = data

    if (!id) {
      apiCooldown()
      return {
        success: false,
        message,
        status: 'MISSING_JOB_ID'
      }
    }

    isPending = false
    return {
      success: true,
      jobId: id
    }
  } catch (err) {
    apiCooldown()
    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}
