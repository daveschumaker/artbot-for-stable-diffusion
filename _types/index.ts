import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { Dispatch } from 'react'
import { TextualInversion } from './horde'
import { SavedLora } from './artbot'

export interface CheckImage {
  success: boolean
  status?: string
  message?: string
  jobId?: string
  done?: boolean
  queue_position?: number
  is_possible?: boolean
  wait_time?: number
  processing?: number
  waiting?: number
  finished?: number
}

export enum Common {
  Empty = ''
}
export interface CreateImageJob {
  allowNsfw?: boolean
  base64String?: string
  canvasData?: any
  canvasStore?: any
  cfg_scale: number
  clipskip: number
  denoising_strength?: number
  has_source_image?: boolean
  has_source_mask?: boolean
  height: number
  hires: boolean
  id: number
  img2img?: boolean
  initWaitTime?: number
  is_possible?: boolean
  jobId: string
  jobStatus: JobStatus
  jobTimestamp?: number
  karras: boolean
  loras: SavedLora[]
  maskData?: any
  models: Array<string>
  negative: string
  numImages?: number
  orientation?: string
  orientationType?: string
  parentJobId?: string
  post_processing: Array<string>
  prompt: string
  queue_position?: number
  sampler: string
  seed: string
  source_image?: string
  source_mask?: string
  steps: number
  stylePreset: string
  tiling: boolean
  timestamp?: number
  tis: TextualInversion[]
  useTrusted?: boolean
  wait_time?: number
  width: number
  workflow?: 'qr_code' | ''
  extra_texts?: Array<{
    text: string
    reference: string
  }>
}

export interface JobImageDetails {
  base64String: string
  thumbnail?: string
  prompt?: string
}

export interface SelectPropsComponent {
  inputId?: string
  className?: string
  formatOptionLabel?: (option: any, { context }: { context: any }) => any
  inputMode?: string
  isDisabled?: boolean
  isMulti?: boolean
  hideSelectedOptions?: boolean
  isSearchable?: boolean
  maxMenuHeight?: string
  menuPlacement?: string
  menuPortalTarget?: Element | null
  name?: string
  onChange: any
  options: Array<any>
  styles?: any
  value?: Value
  width?: string
}

export interface GenerateResponse {
  id: string
  message?: string
  kudos?: number
}

export type SetInput = Dispatch<Partial<DefaultPromptInput>>

interface AiHordeGeneration {
  censored: boolean
  id: string
  img: string
  model: string
  seed: string
  state: string
  worker_id: string
  worker_name: string
}

type OmittedGeneratedImageProps = 'id' | 'img' | 'state'
export interface GeneratedImage
  extends Omit<AiHordeGeneration, OmittedGeneratedImageProps> {
  base64String: string
  hordeImageId: string
  thumbnail: string
}

export interface FinishedImageResponse {
  success: boolean
  jobId: string
  canRate: boolean
  kudos: number
  generations: Array<GeneratedImage | FinishedImageResponseError>
}

export interface FinishedImageResponseError {
  message: string
  status: string
  success: boolean
}

export enum JobStatus {
  Waiting = 'waiting', // waiting to submit to stable horde api
  Requested = 'requested', // Job sent to API, waiting for response.
  Queued = 'queued', // submitted and waiting
  Processing = 'processing', // image has been sent to a worker and is in-process
  Done = 'done', // finished
  Error = 'error' // something unfortunate has happened
}

export interface IBase64String {
  base64String: string
  height: number
  width: number
}

export interface ICanvas {
  cached: boolean
  canvasRef: any
  drawLayer: any
  maskLayer: any
  visibleCanvas: any
  height: any
  width: any
}

export interface ImageSize {
  orientation: string
  height: number
  width: number
}
export interface IOrientation {
  value: string
  label: string
  width?: number
  height?: number
}

export enum PromptTypes {
  DefaultNegative = 'defaultNegative',
  Negative = 'negative',
  PromptFavorite = 'promptFavorite',
  PromptHistory = 'promptHistory'
}

export interface Value {
  value: string | boolean | null
  label: string
}
