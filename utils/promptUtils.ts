import { validSampler } from './validationUtils'

export enum SourceProcessing {
  Prompt = 'prompt',
  Img2Img = 'img2img',
  InPainting = 'inpainting',
  OutPaiting = 'outpainting'
}
interface SavePrompt {
  img2img: boolean
  imageType: string
  copyPrompt: boolean
  prompt: string
  sampler: string
  cfg_scale: number
  orientation: string
  karras: boolean
  height: number
  width: number
  steps: number
  parentJobId: string
  negative?: string
  triggers?: Array<string>
  source_image?: string
  source_processing?:
    | SourceProcessing.Prompt
    | SourceProcessing.Img2Img
    | SourceProcessing.InPainting
    | SourceProcessing.OutPaiting
  source_mask?: string
  denoising_strength?: number
  models: Array<string>
}

let initPromptDetails: SavePrompt = {
  img2img: false,
  imageType: '',
  copyPrompt: false,
  prompt: '',
  sampler: 'k_euler_a',
  cfg_scale: 9.0,
  orientation: '',
  karras: false,
  steps: 25,
  height: 512,
  width: 512,
  parentJobId: '',
  negative: '',
  triggers: [],
  source_image: '',
  source_processing: SourceProcessing.Prompt,
  source_mask: '',
  denoising_strength: 0.75,
  models: ['stable_diffusion']
}

let promptDetails: SavePrompt = Object.assign({}, initPromptDetails)

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({
  img2img = false,
  imageType = '',
  prompt = '',
  orientation = '',
  karras = false,
  sampler = 'k_euler_a',
  cfg_scale = 9.0,
  steps = 25,
  height = 512,
  width = 512,
  parentJobId = '',
  negative = '',
  triggers = [],
  source_image = '',
  source_processing = SourceProcessing.Prompt,
  source_mask = '',
  denoising_strength = 0.75,
  models = ['stable_diffusion']
} = {}) => {
  const samplerValid = validSampler(sampler)
  promptDetails = {
    img2img,
    imageType,
    copyPrompt: true,
    prompt,
    orientation,
    karras,
    sampler: samplerValid ? sampler : 'k_euler_a',
    cfg_scale,
    steps,
    height,
    width,
    parentJobId,
    negative,
    triggers,
    source_image,
    source_processing,
    source_mask,
    denoising_strength,
    models
  }
}

export const loadEditPrompt = () => {
  return Object.assign({}, promptDetails)
}

export const clearPrompt = () => {
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
