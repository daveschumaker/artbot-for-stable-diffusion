import { modifyPromptForStylePreset } from '../utils/imageUtils'
import { SourceProcessing } from '../utils/promptUtils'
import AppSettings from './AppSettings'

export interface IApiParams {
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
  seed: string
  steps: number
  karras: boolean
  hires: boolean
  clipskip: number
  models: Array<string>
  triggers?: Array<string>
  tiling: boolean
  source_image?: string
  source_processing?: string
  stylePreset: string
  post_processing: Array<string>
  source_mask?: string
  denoising_strength?: number
  control_type?: string
}

interface ParamsObject {
  sampler_name?: string // Optional due to controlNet
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  denoising_strength?: number
  control_type?: string
  karras: boolean
  hires_fix: boolean
  clip_skip: number
  tiling: boolean
  post_processing: string[]
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
      seed = '',
      steps,
      models,
      karras = false,
      hires = false,
      clipskip = 1,
      tiling = false,
      source_image,
      source_processing,
      stylePreset,
      post_processing = [],
      source_mask,
      denoising_strength,
      control_type
    } = imageDetails
    let negative = imageDetails.negative || ''

    const { hasError = false } = options

    const apiParams: IApiParams = {
      prompt,
      params: {
        cfg_scale: Number(cfg_scale),
        seed,
        sampler_name: sampler,
        height: Number(height),
        width: Number(width),
        post_processing: [...post_processing],
        steps: Number(steps),
        tiling,
        karras,
        hires_fix: hires,
        clip_skip: clipskip,
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
      (SourceProcessing.InPainting || SourceProcessing.OutPainting)
    ) {
      apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
      apiParams.source_image = source_image
      apiParams.source_processing = source_processing
      apiParams.source_mask = source_mask
      apiParams.models = ['stable_diffusion_inpainting']
    }

    if (control_type && control_type !== '' && source_image) {
      apiParams.params.control_type = control_type
    }

    // Handle a very poor decision on my part
    if (control_type === 'none') {
      apiParams.params.control_type = ''
    }

    // Handle style presets, as well as adding any negative prompts to input prompt string
    apiParams.prompt = modifyPromptForStylePreset({
      prompt,
      negative,
      stylePreset
    })

    // Strip source_image and _source mask from object if we want to show request details if error occurred.
    if (hasError === true) {
      if (apiParams.source_image) {
        apiParams.source_image = '[true] (string removed for log output)'
      }

      if (apiParams.source_mask) {
        apiParams.source_mask = '[true] (string removed for log output)'
      }
    }

    // Things to remove
    if (control_type && control_type !== '' && source_image) {
      delete apiParams.params.denoising_strength
      delete apiParams.params.sampler_name
      apiParams.params.karras = false
      apiParams.params.hires_fix = false
    }

    if (source_image) {
      apiParams.params.hires_fix = false
    }

    return apiParams
  }
}

export default ImageParamsForApi
