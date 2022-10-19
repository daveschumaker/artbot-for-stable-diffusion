export interface DiffusionModel {
  name: string
  count: number
  performance: number
}

export interface CreateImageJob {
  jobTimestamp?: number
  jobId?: string
  img2img?: boolean
  prompt: string
  height: number
  width: number
  cfg_scale: number
  steps: number
  sampler: string
  apikey?: string
  seed?: string
  numImages?: number
  useTrusted?: boolean
  parentJobId?: string
  models: Array<string>
  negative?: string
  allowNsfw?: boolean
  source_image?: string
  denoising_strength?: number
  orientationType?: string
  orientation?: string
}

export interface GenerateResponse {
  id: string
  message?: string
}

export interface KeypressEvent {
  keyCode: number
  preventDefault: () => {}
  shiftKey: boolean
}

export interface ModelDetails {
  name: string
  count?: number
}
