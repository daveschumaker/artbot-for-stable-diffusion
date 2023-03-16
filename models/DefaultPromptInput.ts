import { SourceProcessing } from '../utils/promptUtils'

interface IParams {
  control_type?: string
  source_image?: string
  height?: number
  width?: number
}
class DefaultPromptInput {
  img2img: boolean
  upscaled: boolean
  imageType: string
  orientationType: string
  height: number
  width: number
  numImages: number
  prompt: string
  sampler: string
  cfg_scale: number
  steps: number
  multiSteps: string
  multiGuidance: string
  seed: string
  denoising_strength: number
  control_type: string
  karras: boolean
  hires: boolean
  clipskip: number
  parentJobId: string
  negative: string
  triggers: Array<string>
  tiling: boolean
  source_image: string
  source_mask: string
  stylePreset: string
  source_processing: SourceProcessing
  post_processing: Array<string>
  facefixer_strength: number
  models: Array<string>
  useAllModels: boolean
  useFavoriteModels: boolean
  useAllSamplers: boolean
  useMultiSteps: boolean
  useMultiGuidance: boolean
  canvasData: any | null
  maskData: any | null

  constructor({
    control_type = '',
    source_image = '',
    height = 512,
    width = 512
  }: IParams = {}) {
    this.img2img = false
    this.upscaled = false
    this.imageType = ''
    this.orientationType = 'square'
    this.height = Number(height)
    this.width = Number(width)
    this.numImages = 1
    this.prompt = ''
    this.sampler = 'k_euler_a'
    this.cfg_scale = 9
    this.steps = 20
    this.multiSteps = ''
    this.multiGuidance = ''
    this.seed = ''
    this.denoising_strength = 0.75
    this.control_type = String(control_type)
    this.karras = true
    this.hires = false
    this.clipskip = 1
    this.parentJobId = ''
    this.negative = ''
    this.triggers = []
    this.tiling = false
    this.source_image = source_image
    this.source_mask = ''
    this.stylePreset = 'none'
    this.source_processing = SourceProcessing.Prompt
    this.post_processing = []
    this.facefixer_strength = 0.75
    this.models = ['stable_diffusion']
    this.useAllModels = false
    this.useFavoriteModels = false
    this.useAllSamplers = false
    this.useMultiSteps = false
    this.useMultiGuidance = false
    this.canvasData = null
    this.maskData = null
  }
}

export default DefaultPromptInput
