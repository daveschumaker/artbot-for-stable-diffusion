import { Common, JobStatus } from '_types'
import { AiHordeEmbedding, SavedLora } from '_types/artbot'
import { SourceProcessing } from '_types/horde'
import { uuidv4 } from 'app/_utils/appUtils'
import DefaultPromptInput from '../DefaultPromptInput'

class ImageJob {
  // Job Status Settings
  jobId: string
  parentJobId?: string
  timestamp_created: number
  timestamp_updated: number
  status: JobStatus

  // ArtBot specific parameters
  // favorited?: boolean // Move to separate table?
  canvasData?: any
  maskData?: any
  modelVersion?: string
  orientationType?: string
  shortlink?: string
  showcaseRequested?: boolean
  useXyPlot?: boolean

  // AI Horde image creation parameters
  cfg_scale: number
  clipskip: number
  control_type: string
  denoising_strength: number | Common.Empty
  facefixer_strength?: number
  height: number
  hires: boolean
  image_is_control: boolean
  karras: boolean
  loras: SavedLora[]
  models: Array<string>
  negative: string
  numImages: number
  post_processing: Array<string>
  prompt: string
  return_control_map: boolean
  sampler: string
  seed: string
  shareImagesExternally: boolean
  source_image?: string
  source_mask?: string
  source_processing: SourceProcessing
  steps: number
  tiling: boolean
  tis: AiHordeEmbedding[]
  width: number

  // AI Horde image completed parameters
  kudos: number
  worker_id?: string
  worker_name?: string

  constructor({
    canvasData,
    cfg_scale,
    clipskip,
    control_type,
    denoising_strength,
    height,
    hires,
    image_is_control,
    karras,
    loras,
    maskData,
    models,
    negative,
    numImages,
    orientationType,
    parentJobId,
    post_processing,
    prompt,
    return_control_map,
    sampler,
    seed,
    shareImagesExternally,
    source_image,
    source_mask,
    source_processing,
    steps,
    tiling,
    tis,
    useXyPlot,
    width
  }: ImageJob) {
    this.jobId = uuidv4() // TODO: Index me!
    this.parentJobId = parentJobId // TODO: Index me!
    this.timestamp_created = Date.now()
    this.timestamp_updated = Date.now()
    this.status = JobStatus.Waiting // TODO: Index me!

    // ArtBot specific parameters
    this.canvasData = canvasData
    this.maskData = maskData
    this.orientationType = orientationType
    this.useXyPlot = useXyPlot

    // AI Horde image creation parameters
    this.cfg_scale = cfg_scale
    this.clipskip = clipskip
    this.control_type = control_type
    this.denoising_strength = denoising_strength
    this.height = height
    this.hires = hires
    this.image_is_control = image_is_control
    this.karras = karras
    this.loras = loras
    this.models = models
    this.negative = negative // Negative prompt, will be concactenated with prompt when job is submitted.
    this.numImages = numImages
    this.post_processing = post_processing
    this.prompt = prompt
    this.return_control_map = return_control_map
    this.sampler = sampler
    this.seed = seed
    this.shareImagesExternally = shareImagesExternally
    this.source_image = source_image // TODO: Separate table?
    this.source_mask = source_mask // TODO: Separate table?
    this.source_processing = source_processing
    this.steps = steps
    this.tiling = tiling
    this.tis = tis
    this.width = width

    // AI Horde image completed parameters
    this.kudos = 0 // TODO: Will be updated once job is completed.
    this.worker_id = ''
    this.worker_name = ''
  }

  static toDefaultPromptInput = (
    imageDetails: ImageJob
  ): DefaultPromptInput => {
    const promptInput: DefaultPromptInput = {
      canvasData: imageDetails.canvasData,
      cfg_scale: imageDetails.cfg_scale,
      clipskip: imageDetails.clipskip,
      control_type: imageDetails.control_type,
      denoising_strength: imageDetails.denoising_strength,
      facefixer_strength: imageDetails.facefixer_strength ?? 0.75,
      height: imageDetails.height,
      hires: imageDetails.hires,
      image_is_control: imageDetails.image_is_control,
      imageType: '',
      karras: imageDetails.karras,
      loras: imageDetails.loras,
      maskData: imageDetails.maskData,
      models: imageDetails.models,
      multiClip: '',
      multiDenoise: '',
      multiGuidance: '',
      multiSamplers: [],
      multiSteps: '',
      negative: imageDetails.negative,
      numImages: imageDetails.numImages,
      orientationType: imageDetails.orientationType ?? '',
      parentJobId: imageDetails.parentJobId ?? '',
      post_processing: imageDetails.post_processing,
      prompt: imageDetails.prompt,
      return_control_map: imageDetails.return_control_map,
      sampler: imageDetails.sampler,
      seed: imageDetails.seed,
      source_image: imageDetails.source_image ?? '',
      source_mask: imageDetails.source_mask ?? '',
      source_processing: imageDetails.source_processing,
      steps: imageDetails.steps,
      tiling: imageDetails.tiling,
      tis: imageDetails.tis,
      triggers: [],
      upscaled: false,
      useAllModels: false,
      useAllSamplers: false,
      useFavoriteModels: false,
      useMultiClip: false,
      useMultiDenoise: false,
      useMultiGuidance: false,
      useMultiSamplers: false,
      useMultiSteps: false,
      useXyPlot: false,
      width: imageDetails.width
    }

    return promptInput
  }

  // Delete anything related to this JobID. Tags, etc.
  // static deleteImage(jobId: string) {}

  // static toggleFavorite(jobId: string) {}

  // storeImage(base64String: string) {}
}

export default ImageJob
