/**
 * Types used for directly interacting with AI Horde API services (requests and responses)
 */

import { PromptApiError } from './artbot'

export interface CreateImageResponse {
  success: boolean
  jobId: string
}

export enum CONTROL_TYPES {
  canny = 'canny',
  hed = 'hed',
  depth = 'depth',
  normal = 'normal',
  openpose = 'openpose',
  seg = 'seg',
  scribble = 'scribble',
  fakescribbles = 'fakescribbles',
  hough = 'hough'
}

export interface CreateImageResponseFromApi {
  id: string
  message?: string
}

export interface ErrorResponse {
  success: boolean
  status: PromptApiError
  message: string
}

export interface CheckImageAsyncResponse {
  done: boolean
  faulted: boolean
  finished: number
  is_possible: boolean
  kudos: number
  processing: number
  queue_position: number
  restarted: number
  wait_time: number
  waiting: number
}

export interface CheckImageResponse extends CheckImageAsyncResponse {
  success: boolean
}

export interface CreateImageAsyncResponse {
  id: string
  kudos: number
}

export interface CreateImagePayload {
  censor_nsfw: boolean
  models: Array<string>
  nsfw: boolean
  params: CreateImageParamsObject
  prompt: string
  r2?: boolean
  replacement_filter?: boolean
  shared?: boolean
  slow_workers?: boolean
  source_image?: string
  source_mask?: string
  source_processing?: string
  trusted_workers: boolean
  worker_blacklist?: boolean
  workers?: Array<string>
}

export interface CreateImageParamsObject {
  cfg_scale: number
  clip_skip: number
  control_type?: string
  denoising_strength?: number
  facefixer_strength?: number
  height: number
  hires_fix: boolean
  image_is_control?: boolean
  karras: boolean
  loras?: Lora[]
  n: number
  post_processing: string[]
  return_control_map?: boolean
  sampler_name?: string // Optional due to controlNet
  seed?: string
  steps: number
  tiling: boolean
  width: number
}

export interface GetFinishedImageAsyncReponse {
  done: boolean
  faulted: boolean
  finished: number
  generations: Array<{
    censored: boolean
    id: string
    img: string
    model: string
    seed: string
    state: string
    worker_id: string
    worker_name: string
  }>
  is_possible: boolean
  kudos: number
  processing: number
  queue_position: number
  restarted: number
  shared: boolean
  wait_time: number
  waiting: number
}

export interface HordePreset {
  cfg_scale?: number
  height?: number
  hires_fix?: boolean
  karras?: boolean
  sampler?: string
  clip_skip?: boolean
  loras?: Array<{
    name: string
    inject_trigger?: string
    model?: number
    clip?: number
  }>
  tis?: Array<{ name: string; inject_ti?: string; strength?: number }>
  model?: string
  prompt: string
  sampler_name?: string
  steps?: number
  width?: number
}

export interface IKudosDetails {
  accumulated: number
  awarded: number
  gifted: number
  received: number
  recurring: number
}

export enum InjectTi {
  Prompt = 'prompt',
  NegPrompt = 'negprompt'
}

export interface Lora {
  name: string
  model: number
  clip: number
}

export interface ModelDetails {
  name: string
  baseline: string
  type: string
  homepage?: string
  inpainting: boolean
  description: string
  showcases: string[]
  version: string
  style: string
  nsfw: boolean
  trigger?: string[]
  download_all: boolean
  config: { files: string[]; download: string[] }
  available: boolean
}

export enum SourceProcessing {
  Prompt = 'prompt',
  Img2Img = 'img2img',
  InPainting = 'inpainting',
  OutPainting = 'outpainting'
}

export interface TextualInversion {
  name: string
  inject_ti?: string
  strength?: number
}

export interface WorkerDetails {
  id: string
}
