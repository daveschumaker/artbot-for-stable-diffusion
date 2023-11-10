import React, { CSSProperties, Dispatch, ReactNode } from 'react'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { HordeWorkerDetails, IKudosDetails, InjectTi } from './horde'
import { Embedding } from './civitai'

declare global {
  interface Window {
    _artbot?: {
      getAllPendingJobs?: any
      getAllPendingJobsFromController?: any
      togglePendingJobsControllerLogs?: any
    }
  }
}

export interface AppDetailsStore {
  unsupportedBrowser: boolean
}

/** AI Horde and site settings used across ArtBot */

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}
export interface AppSettingsParams {
  allowNsfwImages: boolean
  apiKey: string
  blockedWorkers: HordeWorkerDetails[]
  shareImagesExternally: boolean
  slow_workers: boolean
  useReplacementFilter: boolean
  useTrusted: boolean
  useWorkerId: string
}

export interface AvailableModelsCache {
  loaded: boolean
  models: Array<any>
  timestamp: number
}

export interface BlockedWorker {
  id: string
  timestamp: string
}

export enum Common {
  Empty = ''
}

export interface CreatePageQueryParams {
  drawing?: string | null
  i?: string | null
  model?: string | null
  prompt?: string | null
}

export interface GetSetPromptInput {
  input: DefaultPromptInput
  setInput: SetInput
}

export enum JobStatus {
  Waiting = 'waiting', // waiting to submit to send job to AI Horde API
  Requested = 'requested', // Job sent to API, waiting for response.
  Queued = 'queued', // Job submitted to API and queued up for worker.
  Processing = 'processing', // Job has been sent to a worker and is in-process
  Done = 'done', // finished
  Error = 'error' // something unfortunate has happened
}

export interface IAvailableModels {
  // [key: string]: IStableDiffusionModel
  [key: string]: any
}

export interface ImageOrientation {
  label: string
  orientation: string
  height: number
  width: number
}

export interface IModelsDetails {
  [key: string]: ModelDetails
}

export interface ModelDetails {
  description: string
  baseline: string
  homepage: string
  showcases: Array<string>
  name: string
  nsfw: boolean
  style: string
  trigger?: Array<string>
  type: string
  version: string
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

export interface ITeam {
  name: string | null
  id: string | null
}

export interface InputComponentProps {
  autoFocus?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  error?: boolean | string
  max?: number
  min?: number
  name?: string
  onBlur?: any
  onChange: any
  onKeyDown?: (e: any) => void
  placeholder?: string
  selectAll?: boolean
  step?: number
  tabIndex?: number
  type?: string
  value: number | string
  width?: string
}

export interface IWorker {
  id: string
  name: string
  team: ITeam
  kudos_rewards: number
  online: boolean
  uptime: number
  max_pixels: number
  maintenance_mode: boolean
  requests_fulfilled: number
  models: Array<string>
  threads: number
  trusted: boolean
  performance: string
}

export interface IWorkers {
  [key: string]: IWorker
}

export interface ModelDetailsCache {
  details: object
  loaded: boolean
  timestamp: number
}

export interface ModelStore {
  availableModelNames: Array<string>
  availableModels: IAvailableModels
  modelDetails: IModelsDetails
  inpaintingWorkers: number
  sort: string
}

export interface NumberInputComponentProps {
  disabled?: boolean
  max: number
  min: number
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onMinusClick: () => void
  onPlusClick: () => void
  style?: CSSProperties
  value: number
}

export interface NumericInputSliderComponentProps {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  tooltip?: string
  value: number
}

export interface OrientationLookup {
  [key: string]: ImageOrientation
}

export interface OverlayComponentProps {
  disableBackground?: boolean
  handleClose?: () => void
  zIndex?: number
}

export enum PromptApiError {
  FORBIDDEN_REQUEST = 'FORBIDDEN_REQUEST',
  HORDE_OFFLINE = 'HORDE_OFFLINE',
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_PARAMS = 'INVALID_PARAMS',
  MAX_REQUEST_LIMIT = 'MAX_REQUEST_LIMIT',
  QUESTIONABLE_PROMPT = 'QUESTIONABLE_PROMPT',
  UNTRUSTED_IP = 'UNTRUSTED_IP',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  HAS_PENDING_JOB = 'HAS_PENDING_JOB'
}

export interface PromptHistoryDetails {
  id: number
  prompt: string
  promptType: string
  timestamp: number
}

export enum PromptTypes {
  DefaultNegative = 'defaultNegative',
  Negative = 'negative',
  PromptFavorite = 'promptFavorite',
  PromptHistory = 'promptHistory'
}

export interface RandomSamplerParams {
  source_processing: string
  steps: number
}

export interface SavedLora {
  name: string
  baseModel: string
  image: string
  label: string
  model: number
  clip: number
  trainedWords: string[]
}

export interface SelectComponentProps {
  className?: string
  isDisabled?: boolean
  isMulti?: boolean
  isSearchable?: boolean
  menuPlacement?: string
  hideSelectedOptions?: boolean
  name?: string
  onChange: any
  options: Array<any>
  styles?: any
  value?: Value
  width?: string
}

export interface SelectModelDetailsProps {
  models: Array<string>
  multiModels: boolean
}

export type SetInput = Dispatch<Partial<DefaultPromptInput>>

export interface SliderComponentProps {
  value: number
  min: number
  max: number
  step: number
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export interface StylePresetParams {
  prompt: string
  negative: string
}

export interface TooltipComponentProps {
  children: ReactNode
  disabled?: boolean
  targetId: string
}

export interface UserInfo {
  username: string
  kudos: number
  kudos_details: IKudosDetails
  records: any
  sharedKey: boolean
  trusted: boolean
  worker_ids: Array<string> | null
  sharedkey_ids: Array<string>
}

export interface UserStore {
  records: any
  username: string
  kudos: number
  kudos_details: IKudosDetails
  loggedIn: boolean | null
  sharedKey: boolean
  trusted: boolean
  worker_ids: Array<string> | null
  workers: IWorkers
  sharedkey_ids: Array<string>
}

export interface Value {
  value: string | boolean
  label: string
}
