import { SavedLora } from '_types/artbot'
import { modifyPromptForStylePreset } from 'app/_utils/imageUtils'
import { SourceProcessing } from 'app/_utils/promptUtils'
import AppSettings from './AppSettings'
import { Lora, TextualInversion } from '_types/horde'
import { castTiInject } from 'app/_utils/hordeUtils'

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
  loras: SavedLora[]
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

    // Temporarily (?) disabled as rating of user generated AI images is no longer supported by the AI Horde
    // const shareImage = AppSettings.get('shareImagesExternally') || false
    const shareImage = false

    const useAllowedWorkers = AppSettings.get('useAllowedWorkers') || false
    const useBlockedWorkers = AppSettings.get('useBlockedWorkers') || false
    const allowedWorkers = AppSettings.get('allowedWorkers') || []
    const blockedWorkers = AppSettings.get('blockedWorkers') || []

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

    if (useBlockedWorkers && blockedWorkers.length > 0) {
      const blocked = blockedWorkers.map(
        (worker: { value: string }) => worker.value
      )
      apiParams.workers = [...blocked]
      apiParams.worker_blacklist = true
    }

    if (!useBlockedWorkers && useAllowedWorkers && allowedWorkers.length > 0) {
      const allowed = allowedWorkers.map(
        (worker: { value: string }) => worker.value
      )
      apiParams.workers = [...allowed]

      // Potential ArtBot / AI Horde API interface issue.
      // If we're explicitly choosing a worker, we probably don't care, delete them.
      // Somehow, this seems to allow jobs to be processed again.
      delete apiParams.worker_blacklist
      delete apiParams.slow_workers
      delete apiParams.replacement_filter

      apiParams.shared = false
      apiParams.trusted_workers = false
    }

    if (!useAllowedWorkers && !useBlockedWorkers) {
      delete apiParams.worker_blacklist
      delete apiParams.workers
    }

    // If user has enabled forceSelectedWorker, override any other worker preference setting.
    const worker = sessionStorage.getItem('forceSelectedWorker')
    console.log(`stuck worker state?`, worker)
    if (worker) {
      const workerId = JSON.parse(worker).value
      console.log(`we get here??`, workerId)
      apiParams.workers = [workerId]
      delete apiParams.worker_blacklist
      delete apiParams.slow_workers

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
      // Fields removed before sending request to API.
      delete apiParams.params.sampler_name
    }

    if (loras && loras.length === 0) {
      delete apiParams.params.loras
    }

    return apiParams
  }
}

export default ImageParamsForApi
