export interface CreateImageJob {
  id: number
  jobTimestamp?: number
  jobId?: string
  jobStatus?: string
  img2img?: boolean
  prompt: string
  height: number
  width: number
  timestamp?: number
  cfg_scale: number
  karras: boolean
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
  source_mask?: string
  denoising_strength?: number
  orientationType?: string
  orientation?: string
  wait_time?: number
  queue_position?: number
  base64String?: string
  initWaitTime?: number
  canvasStore?: any

  has_source_mask?: boolean
  has_source_image?: boolean
}

export interface CreatePendingJob {
  id?: number
  timestamp: number
  jobStatus?: JobStatus
  errorMessage?: string
  groupJobId: string
  jobId?: string
  prompt: string
  img2img?: boolean
  numImages: number
  orientationType: string
  orientation: string
  karras: boolean
  height: number
  width: number
  parentJobId: string
  jobTimestamp: number
  models: Array<string>
  cfg_scale: number
  steps: number
  sampler: string
  jobStartTimestamp: number

  source_processing?: string
  has_source_mask?: boolean
  has_source_image?: boolean
  useAllModels?: boolean
}

export interface DiffusionModel {
  name: string
  count: number
  performance: number
}

export interface GenerateResponse {
  id: string
  message?: string
}

export enum JobStatus {
  Waiting = 'waiting', // waiting to submit to stable horde api
  Queued = 'queued', // submitted and waiting
  Processing = 'processing', // image has been sent to a worker and is in-process
  Done = 'done', // finished
  Error = 'error' // something unfortunate has happened
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
