import { Common, JobStatus } from '_types'
import { AiHordeEmbedding, SavedLora } from '_types/artbot'
import { SourceProcessing } from '_types/horde'
import { uuidv4 } from 'app/_utils/appUtils'

class ImageJob {
  // Job Status Settings
  jobId: string
  parentJobId?: string
  timestamp_created: number
  timestamp_updated: number
  status: JobStatus

  // ArtBot specific parameters
  // favorited?: boolean // Move to separate table?
  modelVersion?: string
  shortlink?: string
  showcaseRequested?: boolean

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
    cfg_scale,
    clipskip,
    control_type,
    denoising_strength,
    height,
    hires,
    image_is_control,
    karras,
    loras,
    models,
    negative,
    numImages,
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
    width
  }: ImageJob) {
    this.jobId = uuidv4() // TODO: Index me!
    this.parentJobId = parentJobId // TODO: Index me!
    this.timestamp_created = Date.now()
    this.timestamp_updated = Date.now()
    this.status = JobStatus.Waiting // TODO: Index me!

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

  // Delete anything related to this JobID. Tags, etc.
  // static deleteImage(jobId: string) {}

  // static toggleFavorite(jobId: string) {}

  // storeImage(base64String: string) {}
}

export default ImageJob
