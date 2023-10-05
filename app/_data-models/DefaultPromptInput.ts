import { AiHordeEmbedding, Common, SavedLora } from '_types/artbot'
import { SourceProcessing } from '_types/horde'

class DefaultPromptInput {
  canvasData: any | null = ''
  cfg_scale: number = 9
  clipskip: number = 1
  control_type: string = ''
  denoising_strength: number | Common.Empty = 0.75
  facefixer_strength: number = 0.75
  height: number = 512
  hires: boolean = false
  image_is_control: boolean = false
  imageType: string = ''
  karras: boolean = true
  loras: SavedLora[] = []
  maskData: any | null = ''
  models: Array<string> = ['stable_diffusion']
  multiClip: string = ''
  multiDenoise: string = ''
  multiGuidance: string = ''
  multiSteps: string = ''
  negative: string = ''
  numImages: number = 1
  orientationType: string = 'square'
  parentJobId: string = ''
  post_processing: Array<string> = []
  prompt: string = ''
  return_control_map: boolean = false
  sampler: string = 'k_euler'
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
  useMultiSteps: boolean = false
  width: number = 512

  constructor(params: Partial<DefaultPromptInput> = {}) {
    Object.assign(this, params)
  }
}

export default DefaultPromptInput
