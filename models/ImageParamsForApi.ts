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
  slow_workers: boolean
  worker_blacklist?: boolean
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
  facefixer_strength?: number
  source_mask?: string
  denoising_strength?: number
  control_type?: string
  image_is_control?: boolean
  return_control_map?: boolean
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
  image_is_control?: boolean
  return_control_map?: boolean
  facefixer_strength?: number
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
    const useBlocklist = AppSettings.get('blockedWorkers')

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
      facefixer_strength,
      source_mask,
      denoising_strength,
      control_type,
      image_is_control,
      return_control_map
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
      worker_blacklist: false,
      shared: shareImage,
      slow_workers: AppSettings.get('slow_workers') === false ? false : true
    }

    if (useBlocklist) {
      apiParams.workers = [...useBlocklist]
      apiParams.worker_blacklist = true
    }

    if (!useBlocklist && useWorkerId) {
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
    }

    if (control_type && control_type !== '' && source_image) {
      apiParams.params.control_type = control_type
      apiParams.params.image_is_control = image_is_control
      apiParams.params.return_control_map = return_control_map
    }

    // Handle a very poor decision on my part
    if (control_type === 'none') {
      apiParams.params.control_type = ''
      delete apiParams.params.image_is_control
      delete apiParams.params.return_control_map
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

    if (facefixer_strength) {
      apiParams.params.facefixer_strength = facefixer_strength
    }

    if (control_type && control_type !== '' && source_image) {
      // Things to remove
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
