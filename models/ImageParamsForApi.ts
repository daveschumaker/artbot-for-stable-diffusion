import { modifyPromptForStylePreset } from '../utils/imageUtils'
import { SourceProcessing } from '../utils/promptUtils'
import AppSettings from './AppSettings'

interface ApiParams {
  prompt: string
  params: ParamsObject
  nsfw: boolean
  censor_nsfw: boolean
  trusted_workers: boolean
  models: Array<string>
  source_image?: string
  source_processing?: string
  source_mask?: string
  r2?: boolean
  shared?: boolean
  workers?: Array<string>
}

export interface IArtBotImageDetails {
  img2img?: boolean
  prompt: string
  negative: string
  sampler: string
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  karras: boolean
  models: Array<string>
  triggers?: Array<string>
  tiling: boolean
  source_image?: string
  source_processing?: string
  stylePreset: string
  post_processing: Array<string>
  source_mask?: string
  denoising_strength?: number
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
  tiling: boolean
  post_processing?: Array<string>
  n: number
}

interface IOptions {
  hasError?: boolean
}

class ImageParamsForApi {
  constructor(imageDetails: IArtBotImageDetails, options: IOptions = {}) {
    const useTrusted =
      typeof AppSettings.get('useTrusted') === 'undefined'
        ? true
        : AppSettings.get('useTrusted')
    const allowNsfw = AppSettings.get('allowNsfwImages') || false
    const shareImage = AppSettings.get('shareImagesExternally') || false
    const useWorkerId = AppSettings.get('useWorkerId') || ''

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
      tiling,
      source_image,
      source_processing,
      stylePreset,
      post_processing,
      source_mask,
      denoising_strength
    } = imageDetails
    let negative = imageDetails.negative || ''

    const { hasError = false } = options

    const apiParams: ApiParams = {
      prompt,
      params: {
        cfg_scale: Number(cfg_scale),
        sampler_name: sampler,
        height: Number(height),
        width: Number(width),
        steps: Number(steps),
        tiling,
        karras,
        n: 1
      },
      nsfw: allowNsfw, // Use workers that allow NSFW images
      censor_nsfw: !allowNsfw, // Show user NSFW images if created
      trusted_workers: useTrusted,
      models,
      r2: true,
      shared: shareImage
    }

    if (useWorkerId) {
      apiParams.workers = [useWorkerId]
    }

    if (seed) {
      apiParams.params.seed = seed
    } else {
      apiParams.params.seed = ''
    }

    if (source_processing === SourceProcessing.Img2Img) {
      apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
      apiParams.source_image = source_image
      apiParams.source_processing = 'img2img'

      if (source_mask) {
        apiParams.source_mask = source_mask
      }
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
    } else {
      apiParams.params.post_processing = []
    }

    if (stylePreset && stylePreset !== 'none') {
      apiParams.prompt = modifyPromptForStylePreset({ prompt, stylePreset })
    }

    negative = negative?.trim()
    if (negative && apiParams.prompt.indexOf('###') === -1) {
      apiParams.prompt += ' ### ' + negative
    } else if (negative && apiParams.prompt.indexOf('###') >= 0) {
      apiParams.prompt += ' ' + negative
    }

    // Strip source_image and _source mask from object if we want to show request details if error occurred.
    if (hasError === true) {
      if (apiParams.source_image) {
        apiParams.source_image = '[true] (string removed for logging error)'
      }

      if (apiParams.source_mask) {
        apiParams.source_mask = '[true] (string removed for logging error)'
      }
    }

    return apiParams
  }
}

export default ImageParamsForApi
