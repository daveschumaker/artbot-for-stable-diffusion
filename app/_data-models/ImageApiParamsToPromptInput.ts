import DefaultPromptInput from './DefaultPromptInput'
import { IApiParams } from './ImageParamsForApi'

class ImageApiParamsToPromptInput {
  cfg_scale: number
  denoising_strength?: number
  control_type?: string
  image_is_control?: boolean
  return_control_map?: boolean
  height: number
  karras: boolean
  hires: boolean
  clipskip: number
  models: Array<string>
  negative?: string
  orientationType: string
  parentJobId?: string
  post_processing?: Array<string>
  facefixer_strength?: number
  prompt: string
  sampler?: string
  seed: string
  source_image?: string
  source_mask?: string
  steps: number
  tiling: boolean
  triggers?: string[]
  width: number
  canvasData: any
  maskData: any

  constructor(imageParams: IApiParams) {
    const defaultState = new DefaultPromptInput()

    for (const [key, value] of Object.entries(defaultState)) {
      // @ts-ignore
      this[key] = value
    }

    this.prompt = imageParams.prompt
    this.models = imageParams.models
    this.cfg_scale = imageParams.params.cfg_scale
    this.clipskip = imageParams.params.clip_skip
    this.orientationType = 'custom'
    this.height = imageParams.params.height
    this.width = imageParams.params.width
    this.hires = imageParams.params.hires_fix
    this.karras = imageParams.params.karras
    this.post_processing = imageParams.params.post_processing
    this.sampler = imageParams.params.sampler_name
    this.seed = imageParams.params.seed || ''
    this.steps = imageParams.params.steps
    this.tiling = imageParams.params.tiling
    this.return_control_map = imageParams.params.return_control_map
    this.image_is_control = imageParams.params.image_is_control

    if (imageParams.params.facefixer_strength) {
      this.facefixer_strength = imageParams.params.facefixer_strength
    }
  }
}

export default ImageApiParamsToPromptInput
