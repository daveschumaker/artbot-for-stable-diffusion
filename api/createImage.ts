import { modelInfoStore } from '../store/modelStore'
import { GenerateResponse } from '../types'
import { SourceProcessing } from '../utils/promptUtils'
import { trackEvent } from './telemetry'

interface CreateImageResponse {
  statusCode?: number
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
  karras: boolean
  models: Array<string>
  triggers?: Array<string>
  source_image?: string
  source_processing?: string
  post_processing: Array<string>
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
  karras: boolean
  post_processing?: Array<string>
}

const toBool = (value?: string | null) => {
  if (value === 'true' || value === 'True') {
    return true
  } else {
    return false
  }
}

const mapImageDetailsToApi = (imageDetails: ImageDetails) => {
  const modelDetails = modelInfoStore.state.modelDetails
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
    karras,
    triggers,
    source_image,
    source_processing,
    post_processing,
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
      steps: Number(steps),
      karras
    },
    nsfw: allowNsfw,
    trusted_workers: useTrusted,
    models
  }

  if (triggers && triggers?.length > 0) {
    apiParams.prompt = `${triggers.join(' ')} ${prompt}`
  } else if (modelDetails[models[0]]?.trigger) {
    apiParams.prompt = `${modelDetails[models[0]].trigger} ${prompt}`
  }

  if (seed) {
    apiParams.params.seed = seed
  }

  if (source_processing === SourceProcessing.Img2Img) {
    apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
    apiParams.source_image = source_image
    apiParams.source_processing = 'img2img'
  }

  if (
    source_processing ===
    (SourceProcessing.InPainting || SourceProcessing.OutPaiting)
  ) {
    apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
    apiParams.source_image = source_image
    apiParams.source_processing = source_processing
    apiParams.source_mask = source_mask
    apiParams.models = ['stable_diffusion_inpainting']
  }

  if (post_processing.length > 0) {
    apiParams.params.post_processing = post_processing
  }

  return apiParams
}

let isPending = false

export const createImage = async (
  imageDetails: ImageDetails
): Promise<CreateImageResponse> => {
  const apikey = localStorage.getItem('apikey')?.trim() || '0000000000'

  if (!apikey) {
    return {
      success: false,
      status: 'MISSING_API_KEY',
      message: 'Incorrect API key'
    }
  }

  if (isPending) {
    return {
      success: false,
      status: 'WAITING_FOR_PENDING_JOB',
      message: 'Waiting for pending request to finish.'
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
        event: 'ERROR',
        action: 'UNTRUSTED_IP',
        context: 'createImageApi',
        data: {
          imageParams: { ...rest }
        }
      })
      isPending = false
      return {
        success: false,
        status: 'UNTRUSTED_IP',
        message:
          'Cannot send requests from an IP address behind a VPN or Private Relay. Please disable and try again.'
      }
    }

    if (statusCode === 400) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { source_image, ...rest } = imageParams

      trackEvent({
        event: 'ERROR',
        action: 'INVALID_PARAMS',
        context: 'createImageApi',
        data: {
          imageParams: { ...rest }
        }
      })
      isPending = false
      return {
        statusCode,
        success: false,
        status: 'INVALID_PARAMS',
        message
      }
    }

    if (statusCode === 401) {
      isPending = false
      return {
        statusCode,
        success: false,
        status: 'INVALID_API_KEY',
        message
      }
    }

    if (statusCode === 403) {
      isPending = false
      return {
        statusCode,
        success: false,
        status: 'FORBIDDEN_REQUEST',
        message
      }
    }

    if (statusCode === 429) {
      isPending = false
      return {
        statusCode,
        success: false,
        status: 'MAX_REQUEST_LIMIT',
        message
      }
    }

    if (statusCode === 503) {
      isPending = false
      return {
        statusCode,
        success: false,
        status: 'HORDE_OFFLINE',
        message
      }
    }

    if (!id) {
      isPending = false
      return {
        statusCode,
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
    isPending = false

    // Handles weird issue where Safari encodes API key using unicode text.
    if (
      //@ts-ignore
      err.name === 'TypeError' &&
      //@ts-ignore
      err.message.indexOf(`Header 'apikey' has invalid value`) >= 0
    ) {
      trackEvent({
        event: 'ERROR',
        action: 'API_KEY_ERROR',
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
      data: {
        imageParams: { ...rest }
      }
    })
    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}
