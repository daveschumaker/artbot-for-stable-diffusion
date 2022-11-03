import { GenerateResponse } from '../types'
import { SourceProcessing } from '../utils/promptUtils'
import { trackEvent } from './telemetry'

interface CreateImageResponse {
  success: boolean
  jobId?: string
  status?: string
  message?: string
}

interface ImageDetails {
  img2img?: boolean
  prompt: string
  sampler: string
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  models: Array<string>
  source_image?: string
  source_processing?: string
  source_mask?: string
  denoising_strength?: number
}

interface ApiParams {
  prompt: string
  params: ParamsObject
  nsfw: boolean
  trusted_workers: boolean
  models: Array<string>
  source_image?: string
  source_processing?: string
  source_mask?: string
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
  const useTrusted = toBool(localStorage.getItem('useTrusted')) || true
  const allowNsfw = toBool(localStorage.getItem('allowNsfwImages')) || false

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
    source_processing,
    source_mask,
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
    models
  }

  if (seed) {
    apiParams.params.seed = seed
  }

  if (source_processing !== SourceProcessing.Prompt) {
    apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
    apiParams.source_image = source_image
    apiParams.source_processing = source_processing
  } else if (source_image) {
    apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
    apiParams.source_image = source_image
    apiParams.source_processing = 'img2img'
  }

  if (
    source_processing ===
    (SourceProcessing.InPainting || SourceProcessing.OutPaiting)
  ) {
    apiParams.source_mask = source_mask
    apiParams.models = ['stable_diffusion_inpainting']
  }

  return apiParams
}

let isPending = false

const apiCooldown = () => {
  setTimeout(() => {
    isPending = false
  }, 15000)
}

export const createImage = async (
  imageDetails: ImageDetails
): Promise<CreateImageResponse> => {
  const apikey = localStorage.getItem('apikey')?.trim() || '0000000000'

  if (!apikey || isPending) {
    trackEvent({
      event: 'WAITING_FOR_PENDING_JOB',
      content: 'createImageApi'
    })

    return {
      success: false,
      status: 'WAITING_FOR_PENDING_JOB',
      message: 'Waiting for pending job to finish before requesting new image.'
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
    const data = await resp.json()
    const { id, message = '' }: GenerateResponse = data

    if (
      message === 'Only Trusted users are allowed to perform this operation'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { source_image, ...rest } = imageParams
      trackEvent({
        event: 'UNTRUSTED_IP',
        content: 'createImageApi',
        imageParams: rest
      })
      apiCooldown()
      return {
        success: false,
        status: 'UNTRUSTED_IP',
        message
      }
    }

    if (statusCode === 400) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { source_image, ...rest } = imageParams

      trackEvent({
        event: 'INVALID_PARAMS',
        content: 'createImageApi',
        imageParams: rest
      })
      apiCooldown()
      return {
        success: false,
        status: 'INVALID_PARAMS',
        message
      }
    }

    if (statusCode === 401) {
      apiCooldown()
      return {
        success: false,
        status: 'INVALID_API_KEY',
        message
      }
    }

    if (statusCode === 403) {
      apiCooldown()
      return {
        success: false,
        status: 'FORBIDDEN_REQUEST',
        message
      }
    }

    if (statusCode === 429) {
      apiCooldown()
      return {
        success: false,
        status: 'MAX_REQUEST_LIMIT',
        message
      }
    }

    if (statusCode === 503) {
      apiCooldown()
      return {
        success: false,
        status: 'HORDE_OFFLINE',
        message
      }
    }

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

    // Handles weird issue where Safari encodes API key using unicode text.
    if (
      //@ts-ignore
      err.name === 'TypeError' &&
      //@ts-ignore
      err.message.indexOf(`Header 'apikey' has invalid value`) >= 0
    ) {
      trackEvent({
        event: 'API_KEY_ERROR',
        content: 'createImageApi'
      })
      return {
        success: false,
        status: 'API_KEY_ERROR',
        message:
          'Character encoding issue with apikey. Please go to settings page to clear and re-renter your API key.'
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { source_image, ...rest } = imageParams
    trackEvent({
      event: 'UNKNOWN_ERROR',
      content: 'createImageApi',
      imageParams: rest
    })
    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}
