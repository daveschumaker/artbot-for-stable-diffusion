import { Dispatch } from 'react'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { InjectTi } from './horde'
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

/** AI Horde and site settings used across ArtBot */

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}

export enum Common {
  Empty = ''
}

export interface CreatePageQueryParams {
  drawing?: string | null
  i?: string | null
  model?: string | null
  preset?: string | null
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

interface IAvailableModels {
  // [key: string]: IStableDiffusionModel
  [key: string]: any
}

interface ImageOrientation {
  label: string
  orientation: string
  height: number
  width: number
}

export interface IModelsDetails {
  [key: string]: ModelDetails
}

interface ModelDetails {
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

export interface ModelStore {
  availableModelNames: Array<string>
  availableModels: IAvailableModels
  modelDetails: IModelsDetails
  inpaintingWorkers: number
  sort: string
}

export interface OrientationLookup {
  [key: string]: ImageOrientation
}

export interface OverlayComponentProps {
  disableBackground?: boolean
  handleClose?: () => void
  zIndex?: number
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

export interface SavedLora {
  baseModelId: number
  parentModelId: number
  name: string | number
  label: string
  versionLabel: string
  versionId: number
  description: string
  baseModel: string
  trainedWords: string[]
  image: string
  sizeKb: number

  model: number // Strength
  clip: number
  is_version: boolean
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

export interface SelectOption {
  label: string
  value: string | null
}

export type SetInput = Dispatch<Partial<DefaultPromptInput>>

export interface Value {
  value: string | boolean | null
  label: string
}
