import {
  ArtBotJobTypes,
  Common,
  ImageMimeType,
  ImageSize,
  JobStatus,
  Lora
} from '../types'
import { uuidv4 } from '../utils/appUtils'
import { orientationDetails, randomSampler } from '../utils/imageUtils'
import { getModelVersion, validModelsArray } from '../utils/modelUtils'
import { SourceProcessing } from '../utils/promptUtils'
import AppSettings from './AppSettings'

interface IRandomSampler {
  source_processing: string
  steps: number
}
export interface IRequestParams {
  artbotJobType: ArtBotJobTypes
  cfg_scale: number
  denoising_strength?: number
  control_type?: string
  image_is_control: boolean
  return_control_map: boolean
  height: number
  imageMimeType: ImageMimeType
  karras: boolean
  hires: boolean
  clipskip: number
  models: Array<string>
  modelVersion: string
  negative?: string
  numImages: number
  orientationType: string
  parentJobId?: string
  post_processing?: Array<string>
  facefixer_strength: number
  prompt: string
  sampler: string
  seed: string
  source_image?: string
  source_mask?: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  multiSteps: string
  multiGuidance: string
  tiling: boolean
  triggers?: Array<string>
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiSteps: boolean
  useMultiGuidance: boolean
  width: number
  canvasData: any
  maskData: any
  loras: Lora[]
}

class CreateImageRequest {
  cfg_scale: number
  denoising_strength: number | Common.Empty
  control_type: string
  image_is_control: boolean
  return_control_map: boolean
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
  facefixer_strength?: number
  prompt: string
  sampler: string
  seed: string
  shareImagesExternally: boolean
  source_image: string
  source_mask: string
  source_processing: SourceProcessing
  stylePreset: string
  steps: number
  multiSteps: Array<number>
  multiGuidance: Array<number>
  timestamp?: number
  tiling: boolean
  triggers: Array<string>
  upscaled?: boolean
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiSteps: boolean
  useMultiGuidance: boolean
  width: number
  canvasData: any
  maskData: any
  loras: Lora[]

  constructor({
    cfg_scale = 7,
    denoising_strength = 0.75,
    control_type = '',
    image_is_control = false,
    return_control_map = false,
    height = 512,
    imageMimeType = ImageMimeType.WebP,
    karras = true,
    hires = false,
    clipskip = 1,
    models = [],
    negative = '',
    numImages = 1,
    orientationType = 'square',
    parentJobId = '',
    post_processing = [],
    facefixer_strength = 0.75,
    prompt = '',
    sampler = 'k_euler',
    seed = '',
    source_image = '',
    source_mask = '',
    source_processing = SourceProcessing.Prompt,
    stylePreset = 'none',
    steps = 20,
    multiGuidance = '',
    multiSteps = '',
    tiling = false,
    triggers = [],
    useAllModels = false,
    useAllSamplers = false,
    useMultiGuidance = false,
    useMultiSteps = false,
    width = 512,
    canvasData = null,
    maskData = null,
    loras = []
  }: IRequestParams) {
    this.cfg_scale = Number(cfg_scale)
    this.imageMimeType = imageMimeType
    this.jobStatus = JobStatus.Waiting
    this.jobTimestamp = Date.now()

    // Orientation settings
    if (orientationType !== 'random') {
      const imageSize: ImageSize = orientationDetails(
        orientationType,
        height,
        width
      )

      this.orientation = imageSize.orientation
      this.width = Number(imageSize.width)
      this.height = Number(imageSize.height)
    } else {
      this.orientation = 'random'
      this.width = 512
      this.height = 512
    }

    // Stable Diffusion models look best on at least 768 x 768
    if (
      models[0].indexOf('stable_diffusion_2') >= 0 &&
      this.orientation === 'square'
    ) {
      this.width = 768
      this.height = 768
    }

    this.karras = Boolean(karras)
    this.hires = Boolean(hires)
    this.clipskip = Number(clipskip)

    if (models.length === 0) {
      sampler = 'k_euler_a'
    }

    this.models = [...models]
    this.sampler = String(sampler)

    // https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/21
    if (this.sampler === 'dpmsolver' && this.models.length > 1) {
      this.sampler = 'k_euler_a'
    }

    if (this.sampler === 'dpmsolver' && useAllModels === true) {
      this.sampler = 'k_euler_a'
    }

    this.negative = String(negative)
    this.numImages = Number(numImages)
    this.parentJobId = String(parentJobId) || uuidv4()
    this.post_processing = [...post_processing]
    this.prompt = prompt ? String(prompt).trim() : ''
    this.sampler = String(sampler)
    this.seed = String(seed)
    this.source_image = String(source_image)
    this.source_mask = String(source_mask)
    this.source_processing = source_processing
    this.stylePreset = stylePreset
    this.loras = [...loras]

    if (
      this.post_processing.includes('GFPGAN') ||
      this.post_processing.includes('CodeFormers')
    ) {
      this.facefixer_strength = facefixer_strength
    }

    if (
      source_processing === SourceProcessing.Img2Img ||
      source_processing === SourceProcessing.InPainting
    ) {
      this.denoising_strength = Number(denoising_strength)
    } else {
      this.denoising_strength = Common.Empty
    }

    this.control_type = String(control_type)
    this.image_is_control = Boolean(image_is_control)
    this.return_control_map = Boolean(return_control_map)

    if (!source_image || source_mask) {
      this.control_type = ''
    }

    this.steps = Number(steps)
    this.triggers = [...triggers]
    this.useAllModels = Boolean(useAllModels)
    this.useAllSamplers = Boolean(useAllSamplers)
    this.useMultiSteps = Boolean(useMultiSteps)
    this.multiSteps = []
    this.useMultiGuidance = Boolean(useMultiGuidance)
    this.multiGuidance = []

    this.shareImagesExternally = AppSettings.get('shareImagesExternally')

    if (this.models.length === 1 && this.models[0] !== 'random') {
      this.modelVersion = getModelVersion(this.models[0])
    } else {
      // PendingUtils will set modelVersion in the case of random images, multiple images, etc.
      this.modelVersion = ''
    }

    if (useMultiSteps) {
      let cleanMultiSteps = multiSteps.replace(`"`, '')
      cleanMultiSteps = cleanMultiSteps.replace(`'`, '')

      let values = cleanMultiSteps.split(',')
      values.forEach((value) => {
        if (isNaN(Number(value))) {
          return
        }

        this.multiSteps.push(Number(value))
      })
    }

    if (useMultiGuidance) {
      let cleanMulti = multiGuidance.replace(`"`, '')
      cleanMulti = cleanMulti.replace(`'`, '')

      let values = cleanMulti.split(',')
      values.forEach((value) => {
        if (isNaN(Number(value))) {
          return
        }

        this.multiGuidance.push(Number(value))
      })
    }

    this.canvasData = canvasData
    this.maskData = maskData

    this.tiling = tiling

    if (this.source_image || this.source_mask) {
      this.tiling = false
    }
  }

  static getRandomModel(imageParams: any) {
    const currentModels = validModelsArray({ imageParams })
    return currentModels[Math.floor(Math.random() * currentModels.length)].name
  }

  static getRandomOrientation() {
    const imageSize: ImageSize = orientationDetails('random')

    return {
      orientation: imageSize.orientation,
      height: Number(imageSize.height),
      width: Number(imageSize.width)
    }
  }

  static getRandomSampler({ source_processing, steps }: IRandomSampler) {
    const isImg2Img = source_processing !== SourceProcessing.Prompt
    return randomSampler(steps, isImg2Img)
  }
}

export default CreateImageRequest
