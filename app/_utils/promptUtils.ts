import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { PromptTypes } from '_types'
import { logDataForDebugging } from './debugTools'
import { validSampler } from './validationUtils'
import { db } from 'app/_db/dexie'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'

export enum SourceProcessing {
  Prompt = 'prompt',
  Img2Img = 'img2img',
  InPainting = 'inpainting',
  OutPainting = 'outpainting'
}
interface SavePrompt {
  defaultSavePrompt: boolean
  img2img: boolean
  imageType: string
  copyPrompt: boolean
  prompt: string
  sampler: string
  cfg_scale: number
  orientation?: string
  orientationType: string
  karras: boolean
  hires: boolean
  clipskip: number
  seed?: string
  height: number
  width: number
  steps: number
  parentJobId: string
  negative?: string
  triggers?: Array<string>
  tiling: boolean
  source_image?: string
  post_processing: Array<string>
  source_processing?:
    | SourceProcessing.Prompt
    | SourceProcessing.Img2Img
    | SourceProcessing.InPainting
    | SourceProcessing.OutPainting
  source_mask?: string
  denoising_strength?: number
  control_type?: string
  models: Array<string>
  canvasStore?: any
  canvasData?: any
  maskData?: any
  numImages?: number
  loras?: any[]
}

let initPromptDetails: SavePrompt = {
  defaultSavePrompt: true,
  img2img: false,
  imageType: '',
  copyPrompt: false,
  prompt: '',
  sampler: 'k_euler_a',
  cfg_scale: 9.0,
  orientationType: '',
  karras: false,
  hires: false,
  clipskip: 1,
  post_processing: [],
  seed: '',
  steps: 25,
  height: 512,
  width: 512,
  parentJobId: '',
  negative: '',
  triggers: [],
  tiling: false,
  source_image: '',
  source_processing: SourceProcessing.Prompt,
  source_mask: '',
  denoising_strength: 0.75,
  models: ['stable_diffusion'],
  canvasStore: '',
  canvasData: '',
  maskData: '',
  loras: []
}

let promptDetails: SavePrompt = Object.assign({}, initPromptDetails)

export const savePromptV2 = async (imageDetails: any) => {
  const transformJob = CreateImageRequest.toDefaultPromptInput(
    Object.assign({}, imageDetails, { numImages: 1 })
  )

  // Need to use non-debounced method here, otherwise prompt input will be overwritten
  // when loading create page.
  await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(transformJob)
}

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({
  img2img = false,
  imageType = '',
  prompt = '',
  orientation = '',
  karras = false,
  hires = false,
  clipskip = 1,
  seed = '',
  sampler = 'k_euler_a',
  cfg_scale = 9.0,
  steps = 25,
  height = 512,
  width = 512,
  parentJobId = '',
  negative = '',
  post_processing = [],
  triggers = [],
  tiling = false,
  source_image = '',
  source_processing = SourceProcessing.Prompt,
  source_mask = '',
  denoising_strength = 0.75,
  control_type = '',
  models = ['stable_diffusion'],
  canvasStore = null,
  canvasData = null,
  maskData = null,
  loras = []
} = {}) => {
  const samplerValid = validSampler(sampler)
  promptDetails = {
    defaultSavePrompt: false,
    img2img,
    imageType,
    copyPrompt: true,
    prompt,
    orientationType: orientation,
    karras,
    hires,
    clipskip,
    seed,
    sampler: samplerValid ? sampler : 'k_euler_a',
    cfg_scale,
    steps,
    post_processing,
    height,
    width,
    parentJobId,
    negative,
    triggers,
    tiling,
    source_image,
    source_processing,
    source_mask,
    denoising_strength,
    control_type,
    models,
    canvasStore,
    canvasData,
    maskData,
    loras
  }

  // Clone to prompt input settings
  const keysToExclude = [
    // 'canvasStore',
    // 'canvasData',
    'copyPrompt',
    // 'maskData',
    // 'source_image',
    // 'source_mask',
    // 'mask',
    'numImages'
  ]

  // @ts-ignore
  const filteredObject = Object.keys(promptDetails)
    .filter((key) => !keysToExclude.includes(key))
    .reduce((acc, key) => {
      // @ts-ignore
      acc[key] = promptDetails[key]
      return acc
    }, {} as DefaultPromptInput)

  filteredObject.numImages = 1
  PromptInputSettings.saveAllInput(filteredObject)
}

export const loadEditPrompt = () => {
  logDataForDebugging({
    name: 'promtUtils#loadEditPrompt',
    data: Object.assign({}, promptDetails)
  })
  return Object.assign({}, promptDetails)
}

export const clearSavedInputCache = () => {
  promptDetails = Object.assign({}, initPromptDetails)
}

// Caches prompt so that it can be restored when user switches between tabs
let cachedPrompt = ''

export const updatedCachedPrompt = (text: string) => {
  cachedPrompt = text
}

export const getCachedPrompt = () => {
  return cachedPrompt
}

export const hasPromptMatrix = (initPrompt = '') => {
  const matchedMatrix = initPrompt.match(/\{.+?\}/g) || ''

  if (matchedMatrix?.length >= 1) {
    return true
  }

  return false
}

export const promptMatrix = (initPrompt = '') => {
  let newPromptsArray: Array<string> = []
  const matchedMatrix = initPrompt.match(/\{.+?\}/g)

  const parsePrompt = (matched = '') => {
    const updatePrompts: Array<string> = []
    let stripBrackets = matched.replace(/{/g, '').replace(/}/g, '')
    const matchedWordArray = stripBrackets.split('|') || []

    if (newPromptsArray.length === 0) {
      matchedWordArray.forEach((word = '') => {
        let string = initPrompt.replace(matched, word)
        updatePrompts.push(string)
      })
    } else {
      newPromptsArray.forEach((string = '') => {
        matchedWordArray.forEach((word = '') => {
          let newString = string.replace(matched, word)
          updatePrompts.push(newString)
        })
      })
    }

    newPromptsArray = [...updatePrompts]
  }

  matchedMatrix?.forEach((match) => {
    parsePrompt(match)
  })

  return newPromptsArray
}

export const savePromptHistory = async (prompt: string = '') => {
  try {
    const [lastPromptDetails = {}] =
      (await db.prompts
        .orderBy('timestamp')
        .filter(function (entry: any) {
          return entry.promptType === PromptTypes.PromptHistory
        })
        .limit(1)
        .reverse()
        .toArray()) || []

    const { prompt: lastPrompt = '' } = lastPromptDetails

    // Prevent storing prompt if it was the immediately preceding prompt.
    if (prompt.toLowerCase() === lastPrompt.toLowerCase()) {
      return
    }
  } catch (err) {
    // Ah well
  }

  await db.prompts.add({
    prompt: prompt,
    promptType: PromptTypes.PromptHistory,
    timestamp: Date.now()
  })
}
