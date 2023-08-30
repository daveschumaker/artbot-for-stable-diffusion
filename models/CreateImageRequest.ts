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
import DefaultPromptInput from './DefaultPromptInput'
import { TextualInversion } from 'types/horde'

interface IRandomSampler {
  source_processing: string
  steps: number
}
export interface IRequestParams extends DefaultPromptInput {
  artbotJobType: ArtBotJobTypes
  imageMimeType: ImageMimeType
  modelVersion: string
}

class CreateImageRequest {
  canvasData: any
  cfg_scale: number
  clipskip: number
  control_type: string
  denoising_strength: number | Common.Empty
  facefixer_strength?: number
  height: number
  hires: boolean
  image_is_control: boolean
  imageMimeType: ImageMimeType
  jobId?: string
  jobStatus: JobStatus
  jobTimestamp: number
  karras: boolean
  loras: Lora[]
  maskData: any
  models: Array<string>
  modelVersion: string
  multiClip: Array<number>
  multiDenoise: Array<number>
  multiGuidance: Array<number>
  multiSteps: Array<number>
  negative: string
  numImages: number
  orientation: string
  parentJobId: string
  post_processing: Array<string>
  prompt: string
  return_control_map: boolean
  sampler: string
  seed: string
  shareImagesExternally: boolean
  source_image: string
  source_mask: string
  source_processing: SourceProcessing
  steps: number
  tiling: boolean
  tis: TextualInversion[]
  timestamp?: number
  triggers: Array<string>
  upscaled?: boolean
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiClip: boolean
  useMultiDenoise: boolean
  useMultiGuidance: boolean
  useMultiSteps: boolean
  width: number

  constructor({
    canvasData = null,
    cfg_scale = 7,
    clipskip = 1,
    control_type = '',
    denoising_strength = 0.75,
    facefixer_strength = 0.75,
    height = 512,
    hires = false,
    image_is_control = false,
    imageMimeType = ImageMimeType.WebP,
    karras = true,
    loras = [],
    maskData = null,
    models = [],
    multiClip = '',
    multiDenoise = '',
    multiGuidance = '',
    multiSteps = '',
    negative = '',
    numImages = 1,
    orientationType = 'square',
    parentJobId = '',
    post_processing = [],
    prompt = '',
    return_control_map = false,
    sampler = 'k_euler',
    seed = '',
    source_image = '',
    source_mask = '',
    source_processing = SourceProcessing.Prompt,
    steps = 20,
    tiling = false,
    tis = [],
    triggers = [],
    useAllModels = false,
    useAllSamplers = false,
    useMultiClip = false,
    useMultiDenoise = false,
    useMultiGuidance = false,
    useMultiSteps = false,
    width = 512
  }: IRequestParams) {
    this.cfg_scale = Number(cfg_scale)
    this.imageMimeType = imageMimeType
    this.jobStatus = JobStatus.Waiting
    this.jobTimestamp = Date.now()

    // Orientation settings
    if (orientationType === 'random') {
      this.orientation = 'random'
      this.width = 512
      this.height = 512
    } else {
      this.orientation = orientationType
      this.height = height
      this.width = width
    }

    // Stable Diffusion models look best on at least 768 x 768
    if (
      models[0].indexOf('stable_diffusion_2') >= 0 &&
      this.orientation === 'square'
    ) {
      this.width = 768
      this.height = 768
    }

    // SDXL models look best on at least 1024 x 1024
    if (
      models[0].includes('SDXL') &&
      this.orientation === 'square' &&
      this.width < 1024
    ) {
      this.width = 1024
      this.height = 1024
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
    this.loras = [...loras]

    if (Array.isArray(tis) && tis.length > 0) {
      this.tis = tis.map((ti) => {
        const obj: TextualInversion = {
          name: String(ti.name)
        }

        if (ti.inject_ti) {
          obj.inject_ti = ti.inject_ti
        }

        if (ti.strength) {
          obj.strength = ti.strength
        }

        return obj
      })
    } else {
      this.tis = []
    }

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

    this.multiClip = []
    this.multiDenoise = []
    this.multiGuidance = []
    this.multiSteps = []
    this.steps = Number(steps)
    this.triggers = [...triggers]
    this.useAllModels = Boolean(useAllModels)
    this.useAllSamplers = Boolean(useAllSamplers)
    this.useMultiClip = Boolean(useMultiClip)
    this.useMultiDenoise = Boolean(useMultiDenoise)
    this.useMultiGuidance = Boolean(useMultiGuidance)
    this.useMultiSteps = Boolean(useMultiSteps)

    this.shareImagesExternally = AppSettings.get('shareImagesExternally')

    if (this.models.length === 1 && this.models[0] !== 'random') {
      this.modelVersion = getModelVersion(this.models[0])
    } else {
      // PendingUtils will set modelVersion in the case of random images, multiple images, etc.
      this.modelVersion = ''
    }

    if (useMultiClip && multiClip.length > 0) {
      let cleanMultiClip = multiClip.replace(`"`, '')
      cleanMultiClip = cleanMultiClip.replace(`'`, '')

      let values = cleanMultiClip.split(',')
      values.forEach((value) => {
        if (isNaN(Number(value))) {
          return
        }

        this.multiClip.push(Number(value))
      })
    }

    if (useMultiDenoise && multiDenoise.length > 0) {
      let cleanMultiDenoise = multiDenoise.replace(`"`, '')
      cleanMultiDenoise = cleanMultiDenoise.replace(`'`, '')

      let values = cleanMultiDenoise.split(',')
      values.forEach((value) => {
        if (isNaN(Number(value))) {
          return
        }

        this.multiDenoise.push(Number(value))
      })
    }

    if (useMultiSteps && multiSteps.length > 0) {
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

    if (useMultiGuidance && multiGuidance.length > 0) {
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
