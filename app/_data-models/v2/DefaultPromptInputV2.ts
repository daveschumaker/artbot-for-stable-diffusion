import { AiHordeEmbedding, Common, SavedLora } from '_types/artbot'
import { CONTROL_TYPES, SourceProcessing } from '_types/horde'

class DefaultPromptInputV2 {
  cfg_scale: number = 9
  clipskip: number = 1
  control_type: CONTROL_TYPES = '' as CONTROL_TYPES
  denoising_strength: number | Common.Empty = 0.75
  facefixer_strength: number = 0.75
  height: number = 512
  hires: boolean = false
  image_is_control: boolean = false
  karras: boolean = true
  loras: SavedLora[] = []
  models: string[] = ['stable_diffusion']
  negative: string = ''
  numImages: number = 1
  post_processing: string[] = []
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
  triggers: string[] = []
  width: number = 512

  // ArtBot options
  generationId: string = ''
  imageType: string = ''
  orientationType: string = 'square'
  parentJobId: string = ''
  useXyPlot: boolean = false
  version?: number = 2

  // Canvas / drawing / mask data
  canvasData?: any | null = ''
  maskData: any | null = ''

  // Multi-options
  multiClip: string = ''
  multiDenoise: string = ''
  multiGuidance: string = ''
  multiPresets: string[] = []
  multiSamplers: string[] = []
  multiSteps: string = ''
  useAllModels: boolean = false
  useAllSamplers: boolean = false
  useFavoriteModels: boolean = false
  useHordeBatching: boolean = false // If requesting batch of multiple images from the Horde
  useMultiClip: boolean = false
  useMultiDenoise: boolean = false
  useMultiGuidance: boolean = false
  useMultiPresets: boolean = false
  useMultiSamplers: boolean = false
  useMultiSteps: boolean = false

  constructor(params: Partial<DefaultPromptInputV2> = {}) {
    Object.assign(this, params)
  }
}

export default DefaultPromptInputV2
