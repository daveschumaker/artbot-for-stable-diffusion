import { Lora } from 'types'
import { modifyPromptForStylePreset } from '../utils/imageUtils'
import { SourceProcessing } from '../utils/promptUtils'
import AppSettings from './AppSettings'
import { TextualInversion } from 'types/horde'
import { castTiInject } from 'utils/hordeUtils'

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
  replacement_filter?: boolean
  shared?: boolean
  workers?: Array<string>
  slow_workers?: boolean
  worker_blacklist?: boolean
  dry_run?: boolean
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
  loras: Lora[]
  tis: TextualInversion[]
  dry_run?: boolean
}

interface ParamsObject {
  sampler_name?: string // Optional due to ControlNet
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
  loras?: Lora[]
  tis?: TextualInversion[]
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
      return_control_map,
      loras = [],
      tis = [],
      dry_run = false
    } = imageDetails
    let negative = imageDetails.negative || ''

    const { hasError = false } = options

    // explicitly check if prompt-replacement filter is disabled by user. Otherwise, set to true.
    let replacement_filter =
      AppSettings.get('useReplacementFilter') === false ? false : true

    if (replacement_filter && prompt.length >= 1000) {
      replacement_filter = false
    }

    const apiParams: IApiParams = {
      prompt,
      params: {
        cfg_scale: Number(cfg_scale),
        seed: String(seed),
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
      replacement_filter,
      worker_blacklist: false,
      shared: shareImage,
      slow_workers: AppSettings.get('slow_workers') === false ? false : true,
      dry_run
    }

    if (useBlocklist) {
      const blocked = useBlocklist.map((worker: { id: string }) => worker.id)
      apiParams.workers = [...blocked]
      apiParams.worker_blacklist = true
    } else {
      delete apiParams.worker_blacklist
    }

    if (!useBlocklist && useWorkerId) {
      apiParams.workers = [useWorkerId]

      // Potential ArtBot / AI Horde API interface issue.
      // If we're explicitly choosing a worker, we probably don't care, delete them.
      // Somehow, this seems to allow jobs to be processed again.
      delete apiParams.worker_blacklist
      delete apiParams.slow_workers
      delete apiParams.replacement_filter
      apiParams.shared = false
      apiParams.trusted_workers = false
    }

    if (source_processing === SourceProcessing.Img2Img) {
      apiParams.params.denoising_strength = Number(denoising_strength) || 0.75
      apiParams.source_image = source_image
      apiParams.source_processing = 'img2img'

      if (source_mask) {
        apiParams.source_mask = source_mask
      }
    }

    if (loras && Array.isArray(loras) && loras.length > 0) {
      apiParams.params.loras = loras.map((lora) => {
        return {
          name: String(lora.name),
          model: lora.model,
          clip: lora.clip
        }
      })
    }

    if (tis && Array.isArray(tis) && tis.length > 0) {
      apiParams.params.tis = castTiInject(tis)
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

    // SDXL Beta!
    // Need to require two image: https://dbzer0.com/blog/stable-diffusion-xl-beta-on-the-ai-horde/
    if (apiParams.models[0].includes('SDXL_beta')) {
      apiParams.params.n = 2
    }

    if (control_type === 'none') {
      // Handle a very poor decision on my part
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

    if (loras && loras.length === 0) {
      delete apiParams.params.loras
    }

    // SDXL_beta validation options for Stability.ai beta workers
    const filteredBetaModels = models.filter((model) =>
      model.toLowerCase().includes('sdxl_beta')
    )
    const hasSdxlBeta = filteredBetaModels.length > 0

    if (hasSdxlBeta) {
      apiParams.params.karras = false
      apiParams.params.hires_fix = false
      apiParams.params.post_processing = []
      delete apiParams.params.loras
    }

    return apiParams
  }
}

export default ImageParamsForApi
