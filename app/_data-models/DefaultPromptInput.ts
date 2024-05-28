import { AiHordeEmbedding, Common, SavedLora } from '_types/artbot'
import { CONTROL_TYPES, SourceProcessing } from '_types/horde'

class DefaultPromptInput {
  canvasData?: any | null = ''
  cfg_scale: number = 5
  clipskip: number = 1
  control_type: CONTROL_TYPES = '' as CONTROL_TYPES
  denoising_strength: number | Common.Empty = 0.75
  facefixer_strength: number = 0.75
  height: number = 1024
  hires: boolean = false
  image_is_control: boolean = false
  imageType: string = ''
  karras: boolean = true
  loras: SavedLora[] = []
  maskData: any | null = ''
  models: Array<string> = ['AlbedoBase XL (SDXL)']
  multiClip: string = ''
  multiDenoise: string = ''
  multiGuidance: string = ''
  multiSamplers: Array<string> = []
  multiSteps: string = ''
  negative: string = ''
  numImages: number = 1
  orientationType: string = 'square'
  parentJobId: string = ''
  preset: string[] = []
  post_processing: Array<string> = []
  prompt: string = ''
  return_control_map: boolean = false
  sampler: string = 'k_dpmpp_sde'
  seed: string = ''
  source_image: string = ''
  source_mask: string = ''
  source_processing: SourceProcessing = SourceProcessing.Prompt
  steps: number = 20
  tiling: boolean = false
  tis: AiHordeEmbedding[] = []
  triggers: Array<string> = []
  upscaled: boolean = false
  useAllModels: boolean = false
  useAllSamplers: boolean = false
  useFavoriteModels: boolean = false
  useMultiClip: boolean = false
  useMultiDenoise: boolean = false
  useMultiGuidance: boolean = false
  useMultiSamplers: boolean = false
  useMultiSteps: boolean = false
  useXyPlot: boolean = false
  width: number = 1024
  workflow: 'qr_code' | '' = ''
  extra_texts: Array<{ text: string; reference: string }> | null = null

  constructor(params: Partial<DefaultPromptInput> = {}) {
    Object.assign(this, params)
  }
}

export default DefaultPromptInput
