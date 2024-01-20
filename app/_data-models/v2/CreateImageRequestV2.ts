import { AiHordeEmbedding, SavedLora } from '_types/artbot'
import { Common, ImageSize, JobStatus } from '_types'
import { uuidv4 } from 'app/_utils/appUtils'
import { orientationDetails, randomSampler } from 'app/_utils/imageUtils'
import { getModelVersion, validModelsArray } from 'app/_utils/modelUtils'
import { SourceProcessing } from 'app/_utils/promptUtils'
import AppSettings from '../AppSettings'
import DefaultPromptInput from '../DefaultPromptInput'
import { CONTROL_TYPES } from '_types/horde'

interface IRandomSampler {
  source_processing: string
  steps: number
}

class CreateImageRequestV2 {
  canvasData: any
  cfg_scale: number
  clipskip: number
  control_type: CONTROL_TYPES
  denoising_strength: number | Common.Empty
  dry_run: boolean
  facefixer_strength?: number
  height: number
  hires: boolean
  kudos: number
  id: number
  image_is_control: boolean
  jobId: string
  jobStatus: JobStatus
  jobTimestamp: number
  karras: boolean
  loras: SavedLora[]
  maskData: any
  models: Array<string>
  modelVersion: string
  multiClip: Array<number>
  multiDenoise: Array<number>
  multiGuidance: Array<number>
  multiSamplers: Array<string>
  multiSteps: Array<number>
  negative: string
  numImages: number
  orientation: string
  parentJobId: string
  post_processing: Array<string>
  preset: string[]
  prompt: string
  return_control_map: boolean
  sampler: string
  seed: string
  shareImagesExternally: boolean
  shortlink?: string
  showcaseRequested?: boolean
  source_image: string
  source_mask: string
  source_processing: SourceProcessing
  steps: number
  tiling: boolean
  tis: AiHordeEmbedding[]
  timestamp?: number
  triggers: Array<string>
  upscaled: boolean
  useAllModels: boolean
  useAllSamplers: boolean
  useMultiClip: boolean
  useMultiDenoise: boolean
  useMultiGuidance: boolean
  useMultiSamplers: boolean
  useMultiSteps: boolean
  useXyPlot: boolean
  version: number
  width: number

  // Fields related to AI Horde Job Status
  initWaitTime: number | null
  errorMessage: string
  done: boolean
  faulted: boolean
  finished: number
  is_possible: boolean | null
  processing: number
  queue_position: number
  restarted: number
  wait_time: number | null
  waiting: number

  constructor({
    canvasData = null,
    cfg_scale = 7,
    clipskip = 1,
    control_type = '' as CONTROL_TYPES,
    denoising_strength = 0.75,
    dry_run = false,
    facefixer_strength = 0.75,
    height = 512,
    hires = false,
    image_is_control = false,
    karras = true,
    loras = [],
    maskData = null,
    models = [],
    multiClip = '',
    multiDenoise = '',
    multiGuidance = '',
    multiSamplers = [],
    multiSteps = '',
    negative = '',
    numImages = 1,
    orientationType = 'square',
    parentJobId = '',
    post_processing = [],
    preset = [],
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
    upscaled = false,
    useAllModels = false,
    useAllSamplers = false,
    useMultiClip = false,
    useMultiDenoise = false,
    useMultiGuidance = false,
    useMultiSamplers = false,
    useMultiSteps = false,
    useXyPlot = false,
    width = 512
  }: DefaultPromptInput) {
    // Differentiate old image requests from newer image requests.
    this.version = 2

    this.cfg_scale = Number(cfg_scale)
    this.jobStatus = JobStatus.Waiting
    this.jobTimestamp = Date.now()

    // AI Horde Job Progress
    this.errorMessage = ''
    this.initWaitTime = null
    this.done = false
    this.faulted = false
    this.finished = 0
    this.is_possible = null
    this.kudos = 0
    this.processing = 0
    this.queue_position = 0
    this.restarted = 0
    this.wait_time = null
    this.waiting = 0

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

    // SDXL models look best on at least 1024 x 1024
    // TODO: FIXME:
    if (
      models[0].includes('SDXL') &&
      this.orientation === 'square' &&
      this.width < 1024
    ) {
      this.width = 1024
      this.height = 1024
    }

    this.karras = Boolean(karras)
    this.kudos = 0
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

    this.dry_run = dry_run
    this.negative = String(negative)
    this.numImages = Number(numImages)
    this.parentJobId = String(parentJobId) || uuidv4()
    this.post_processing = [...post_processing]
    this.preset = [...preset]
    this.prompt = prompt ? String(prompt).trim() : ''
    this.sampler = String(sampler)
    this.seed = String(seed)
    this.source_image = String(source_image)
    this.source_mask = String(source_mask)
    this.source_processing = source_processing
    this.loras = [...loras]
    this.tis = [...tis]
    this.upscaled = upscaled || false

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

    this.control_type = control_type
    this.image_is_control = Boolean(image_is_control)
    this.return_control_map = Boolean(return_control_map)

    if (!source_image || source_mask) {
      this.control_type = '' as CONTROL_TYPES
    }

    this.multiClip = []
    this.multiDenoise = []
    this.multiGuidance = []
    this.multiSamplers = [...multiSamplers]
    this.multiSteps = []
    this.steps = Number(steps)
    this.triggers = [...triggers]
    this.useAllModels = Boolean(useAllModels)
    this.useAllSamplers = Boolean(useAllSamplers)
    this.useMultiClip = Boolean(useMultiClip)
    this.useMultiDenoise = Boolean(useMultiDenoise)
    this.useMultiGuidance = Boolean(useMultiGuidance)
    this.useMultiSamplers = Boolean(useMultiSamplers)
    this.useMultiSteps = Boolean(useMultiSteps)
    this.useXyPlot = Boolean(useXyPlot)

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

    this.id = 0
    this.jobId = ''
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

  static toDefaultPromptInput = (
    imageDetails: CreateImageRequestV2
  ): DefaultPromptInput => {
    const promptInput: DefaultPromptInput = {
      canvasData: imageDetails.canvasData,
      cfg_scale: imageDetails.cfg_scale,
      clipskip: imageDetails.clipskip,
      control_type: imageDetails.control_type,
      denoising_strength: imageDetails.denoising_strength,
      dry_run: imageDetails.dry_run ?? false,
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
      orientationType: imageDetails.orientation,
      parentJobId: imageDetails.parentJobId,
      post_processing: imageDetails.post_processing,
      preset: imageDetails.preset,
      prompt: imageDetails.prompt,
      return_control_map: imageDetails.return_control_map,
      sampler: imageDetails.sampler,
      seed: imageDetails.seed,
      source_image: imageDetails.source_image,
      source_mask: imageDetails.source_mask,
      source_processing: imageDetails.source_processing,
      steps: imageDetails.steps,
      tiling: imageDetails.tiling,
      tis: imageDetails.tis,
      triggers: imageDetails.triggers,
      upscaled: imageDetails.upscaled,
      useAllModels: imageDetails.useAllModels,
      useAllSamplers: imageDetails.useAllSamplers,
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
}

export default CreateImageRequestV2
