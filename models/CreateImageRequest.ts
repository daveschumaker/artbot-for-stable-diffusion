import { modelInfoStore } from '../store/modelStore'
import {
  ArtBotJobTypes,
  Common,
  ICanvas,
  ImageMimeType,
  ImageSize,
  JobStatus
} from '../types'
import { uuidv4 } from '../utils/appUtils'
import { orientationDetails, randomSampler } from '../utils/imageUtils'
import { SourceProcessing } from '../utils/promptUtils'

export interface IRequestParams {
  artbotJobType: ArtBotJobTypes
  canvasStore?: ICanvas
  cfg_scale: number
  denoising_strength?: number
  height: number
  imageMimeType: ImageMimeType
  karras: boolean
  models: Array<string>
  negative?: string
  numImages: number
  orientationType: string
  parentJobId?: string
  post_processing?: Array<string>
  prompt: string
  sampler: string
  seed?: string
  source_image?: string
  source_mask?: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  triggers?: Array<string>
  useAllModels: boolean
  width: number
}

class CreateImageRequest {
  canvasStore?: ICanvas
  cfg_scale: number
  denoising_strength: number | Common.Empty
  height: number
  imageMimeType: ImageMimeType
  jobId?: string
  jobStatus: JobStatus
  jobTimestamp: number
  karras: boolean
  models: Array<string>
  negative: string
  numImages: number
  orientation: string
  parentJobId: string
  post_processing: Array<string>
  prompt: string
  sampler: string
  seed: string
  source_image: string
  source_mask: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  timestamp?: number
  triggers: Array<string>
  upscaled?: boolean
  useAllModels: boolean
  width: number

  constructor({
    canvasStore,
    cfg_scale = 7,
    denoising_strength = 0.75,
    height = 512,
    imageMimeType = ImageMimeType.WebP,
    karras = true,
    models = [],
    negative = '',
    numImages = 1,
    orientationType = 'square',
    parentJobId = '',
    post_processing = [],
    prompt = '',
    sampler = 'k_euler',
    seed = '',
    source_image = '',
    source_mask = '',
    source_processing = SourceProcessing.Prompt,
    stylePreset = 'none',
    steps = 20,
    triggers = [],
    useAllModels = false,
    width = 512
  }: IRequestParams) {
    if (canvasStore) {
      this.canvasStore = canvasStore
    }

    this.cfg_scale = Number(cfg_scale)
    this.imageMimeType = imageMimeType
    this.jobStatus = JobStatus.Waiting
    this.jobTimestamp = Date.now()

    // Orientation settings
    const imageSize: ImageSize = orientationDetails(
      orientationType,
      height,
      width
    )

    this.orientation = imageSize.orientation
    this.width = Number(imageSize.width)
    this.height = Number(imageSize.height)

    this.karras = Boolean(karras)

    if (models.length === 0) {
      sampler = 'k_euler_a'
    }

    if (models[0] === 'random' || models.length === 0) {
      const currentModels = modelInfoStore.state.availableModelNames
      const randomModel =
        currentModels[Math.floor(Math.random() * currentModels.length)]
      this.models = [randomModel]
    } else {
      this.models = [...models]
    }

    if (source_processing === 'inpainting') {
      this.models = ['stable_diffusion_inpainting']
    }

    this.negative = String(negative)
    this.numImages = Number(numImages)
    this.parentJobId = String(parentJobId) || uuidv4()
    this.post_processing = [...post_processing]
    this.prompt = prompt ? String(prompt).trim() : ''

    if (sampler === 'random') {
      const isImg2Img = source_processing !== SourceProcessing.Prompt
      this.sampler = randomSampler(steps, isImg2Img)
    } else {
      this.sampler = String(sampler)
    }

    this.seed = String(seed)
    this.source_image = String(source_image)
    this.source_mask = String(source_mask)
    this.source_processing = source_processing
    this.stylePreset = stylePreset

    if (source_processing === SourceProcessing.Img2Img) {
      this.denoising_strength = Number(denoising_strength)
    } else {
      this.denoising_strength = Common.Empty
    }

    this.steps = Number(steps)
    this.triggers = [...triggers]
    this.useAllModels = Boolean(useAllModels)
  }
}

export default CreateImageRequest
