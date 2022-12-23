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
import { validModelsArray } from '../utils/modelUtils'
import { SourceProcessing } from '../utils/promptUtils'

interface IRandomSampler {
  source_processing: string
  steps: number
}
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
  multiSteps: string
  triggers?: Array<string>
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiSteps: boolean
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
  multiSteps: Array<number>
  timestamp?: number
  triggers: Array<string>
  upscaled?: boolean
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiSteps: boolean
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
    multiSteps = '',
    triggers = [],
    useAllModels = false,
    useAllSamplers = false,
    useMultiSteps = false,
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

    if (models.length === 0) {
      sampler = 'k_euler_a'
    }

    this.models = [...models]

    if (source_processing === 'inpainting') {
      this.models = ['stable_diffusion_inpainting']
    }

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

    if (source_processing === SourceProcessing.Img2Img) {
      this.denoising_strength = Number(denoising_strength)
    } else {
      this.denoising_strength = Common.Empty
    }

    this.steps = Number(steps)
    this.triggers = [...triggers]
    this.useAllModels = Boolean(useAllModels)
    this.useAllSamplers = Boolean(useAllSamplers)
    this.useMultiSteps = Boolean(useMultiSteps)
    this.multiSteps = []

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
  }

  static getRandomModel() {
    const currentModels = validModelsArray()
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
