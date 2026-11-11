/**
 * Types used for directly interacting with AI Horde API services (requests and responses)
 */

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
    is_version?: boolean
  }>
  tis?: Array<{ name: string; inject_ti?: string; strength?: number }>
  model?: string
  prompt: string
  sampler_name?: string
  steps?: number
  width?: number
}

export interface HordeWorkerDetails {
  id: string
  info: string
  bridge_agent: string
  kudos_details: { generated: number; uptime: number }
  kudos_rewards: number
  loading?: boolean
  lora: boolean
  img2img: boolean
  maintenance_mode: boolean
  max_pixels: number
  models: string[]
  name: string
  nsfw: boolean
  online: boolean
  painting: boolean
  performance: string
  'post-processing': boolean
  requests_fulfilled: number
  team: {
    id: string | null
    name: string | null
  }
  threads: number
  trusted: boolean
  uptime: number
}

export enum InjectTi {
  Prompt = 'prompt',
  NegPrompt = 'negprompt'
}

export interface Lora {
  /** "label" is specifically added by ArtBot in order to store a
   * "nice" name to display on the front-end, or with shared image
   * settings. It should be stripped out when passing an image
   * request to the Horde API.
   */
  label?: string
  name: string
  model: number
  clip: number
  is_version?: boolean
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
