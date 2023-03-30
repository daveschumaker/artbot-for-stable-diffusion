import {
  ArtBotJobTypes,
  Common,
  ICanvas,
  ImageMimeType,
  JobStatus
} from '../types'
import { uuidv4 } from '../utils/appUtils'
import { randomSampler } from '../utils/imageUtils'
import { getModelVersion, validModelsArray } from '../utils/modelUtils'
import { SourceProcessing } from '../utils/promptUtils'

export interface IRequestParams {
  artbotJobType: ArtBotJobTypes
  canvasData?: ICanvas
  cfg_scale: number
  denoising_strength?: number
  height: number
  imageMimeType: ImageMimeType
  karras: boolean
  hires: boolean
  clipskip: number
  models: Array<string>
  negative?: string
  orientation: string
  parentJobId?: string
  post_processing?: Array<string>
  prompt: string
  sampler: string
  source_image?: string
  source_mask?: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  tiling?: boolean
  triggers?: Array<string>
  width: number
}

class RerollImageRequest {
  canvasData?: ICanvas
  cfg_scale: number
  denoising_strength: number | Common.Empty
  height: number
  imageMimeType: ImageMimeType
  jobId?: string
  jobStatus: JobStatus
  jobTimestamp: number
  karras: boolean
  hires: boolean
  clipskip: number
  models: Array<string>
  modelVersion: string
  negative: string
  numImages: number
  orientation: string
  parentJobId: string
  post_processing: Array<string>
  prompt: string
  sampler: string
  source_image: string
  source_mask: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  tiling?: boolean
  timestamp?: number
  triggers: Array<string>
  width: number

  constructor({
    canvasData,
    cfg_scale = 7,
    denoising_strength = 0.75,
    height = 512,
    imageMimeType = ImageMimeType.WebP,
    karras = true,
    hires = false,
    clipskip = 1,
    models = [],
    negative = '',
    orientation = 'square',
    parentJobId = '',
    post_processing = [],
    prompt = '',
    sampler = 'k_euler',
    source_image = '',
    source_mask = '',
    stylePreset = 'none',
    source_processing = SourceProcessing.Prompt,
    steps = 20,
    tiling = false,
    triggers = [],
    width = 512
  }: IRequestParams) {
    if (canvasData) {
      this.canvasData = canvasData
    }

    this.cfg_scale = Number(cfg_scale)
    this.imageMimeType = imageMimeType
    this.jobStatus = JobStatus.Waiting
    this.jobTimestamp = Date.now()

    this.orientation = String(orientation)
    this.width = Number(width)
    this.height = Number(height)

    this.karras = Boolean(karras)
    this.hires = Boolean(hires)
    this.clipskip = Number(clipskip)

    this.negative = String(negative)
    this.numImages = 1
    this.parentJobId = String(parentJobId) || uuidv4()
    this.post_processing =
      post_processing?.filter((value) => {
        return value !== 'RealESRGAN_x4plus'
      }) || []
    this.prompt = prompt ? String(prompt).trim() : ''

    if (sampler === 'random') {
      const isImg2Img = source_processing !== SourceProcessing.Prompt
      this.sampler = randomSampler(steps, isImg2Img)
    } else {
      this.sampler = String(sampler)
    }

    this.tiling = tiling

    this.source_image = String(source_image)
    this.source_mask = String(source_mask)
    this.source_processing = source_processing

    if (source_processing === SourceProcessing.Img2Img) {
      this.denoising_strength = Number(denoising_strength)
    } else {
      this.denoising_strength = Common.Empty
    }

    this.stylePreset = stylePreset
    this.steps = Number(steps)
    this.triggers = [...triggers]

    if (models[0] === 'random') {
      const currentModels = validModelsArray({ imageParams: this })
      const randomModel =
        currentModels[Math.floor(Math.random() * currentModels.length)]
      this.models = [randomModel.name]
    } else {
      this.models = [...models]
    }

    this.modelVersion = getModelVersion(this.models[0])
  }
}

export default RerollImageRequest
