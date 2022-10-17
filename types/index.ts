export interface CreateImageJob {
  img2img?: boolean
  prompt: string
  height?: number
  width?: number
  cfg_scale?: string
  steps?: number
  sampler?: string
  apikey?: string
  seed?: number
  numImages?: number
  useTrusted?: boolean
  parentJobId?: string
  negative?: string
  allowNsfw?: boolean
  source_image?: string
  denoising_strength?: number
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
