import DefaultPromptInput from 'models/DefaultPromptInput'
import { Dispatch } from 'react'
import { SourceProcessing } from 'utils/promptUtils'

export enum ArtBotJobTypes {
  Text2Img = 'Text2Img',
  Img2Img = 'Img2Img',
  Drawing = 'Drawing',
  Inpainting = 'Inpainting',
  Upscale = 'Upscale',
  Reroll = 'Reroll',
  CopyPrompt = 'CopiedPrompt',
  SharedPrompt = 'SharedPrompt',
  Variation = 'Variation'
}

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
  id: number
  is_possible?: boolean
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
  hires: boolean
  clipskip: number
  steps: number
  sampler: string
  apikey?: string
  seed: string
  numImages?: number
  useTrusted?: boolean
  parentJobId?: string
  models: Array<string>
  negative: string
  allowNsfw?: boolean
  source_image?: string
  source_mask?: string
  stylePreset: string
  denoising_strength?: number
  orientationType?: string
  orientation?: string
  wait_time?: number
  queue_position?: number
  base64String?: string
  initWaitTime?: number
  canvasStore?: any
  tiling: boolean
  post_processing: Array<string>
  loras: Array<any>

  has_source_mask?: boolean
  has_source_image?: boolean
}

export interface NewRating {
  dataset_id: string
  id: string
  url: string
}

export interface IImageDetails extends CreateImageJob {
  allowNsfw?: boolean
  apikey?: string
  canvasStore?: any
  control_type: string
  favorited: boolean
  has_source_image?: boolean
  has_source_mask?: boolean
  height: number
  image_is_control: boolean
  imageType: string
  initWaitTime?: number
  is_possible?: boolean
  jobStatus?: string
  jobTimestamp?: number
  loras: Array<any>
  model: string
  modelVersion: string
  numImages?: number
  orientation?: string
  orientationType?: string
  post_processing: Array<string>
  queue_position?: number
  shortlink: string
  source_mask?: string
  source_processing: SourceProcessing
  stylePreset: string
  thumbnail: string
  useTrusted?: boolean
  wait_time?: number
  width: number
  worker_id: string
  worker_name: string
}

interface ImageOrientation {
  label: string
  orientation: string
  height: number
  width: number
}

export interface OrientationLookup {
  [key: string]: ImageOrientation
}

export interface JobImageDetails {
  base64String: string
  thumbnail?: string
  prompt?: string
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
  post_processing: Array<string>
  useAllModels?: boolean
}

export interface DiffusionModel {
  name: string
  count: number
  performance: number
}

export interface SelectPropsComponent {
  className?: string
  inputMode?: string
  isDisabled?: boolean
  isMulti?: boolean
  hideSelectedOptions?: boolean
  isSearchable?: boolean
  menuPlacement?: string
  name?: string
  onChange: any
  options: Array<any>
  styles?: any
  value?: Value
  width?: string
}

export interface Lora {
  name: string
  model: number
  clip: number
}

export interface GenerateResponse {
  id: string
  message?: string
  kudos?: number
}

export type SetInput = Dispatch<Partial<DefaultPromptInput>>

export interface GetSetPromptInput {
  input: DefaultPromptInput
  setInput: SetInput
}

export interface AiHordeGeneration {
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

export enum ImageMimeType {
  Png = 'image/png',
  WebP = 'image/webp'
}

export interface ImageSize {
  orientation: string
  height: number
  width: number
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

export enum ControlTypes {
  None = '',
  Canny = 'canny',
  Hed = 'hed',
  Depth = 'depth',
  Normal = 'normal',
  Openpose = 'openpose',
  Seg = 'seg',
  Scribble = 'scribble',
  FakeScribbles = 'fakescribbles',
  Hough = 'hough'
}

export interface Value {
  value: string | boolean
  label: string
}
