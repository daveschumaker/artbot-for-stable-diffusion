import AppSettings from 'app/_data-models/AppSettings'
import { IOrientation } from '_types'

export const ANON_API_KEY = '0000000000'
export const HORDE_PROD = 'https://aihorde.net'
export const HORDE_DEV = 'https://dev.aihorde.net'
export const RATING_API = 'https://ratings.aihorde.net'
export const FOOTER_HEIGHT_PX = 62
export const CREATE_NEW_JOB_INTERVAL = 1500 // ms between new job requests
export const RATE_IMAGE_CUTOFF_SEC = 900
export const MAX_CONCURRENT_JOBS_ANON = AppSettings.get('maxConcurrency') || 5
export const MAX_CONCURRENT_JOBS_USER = AppSettings.get('maxConcurrency') || 10
export const MAX_IMAGES_PER_JOB = 200
export const MAX_DIMENSIONS_LOGGED_IN = 3072
export const MAX_DIMENSIONS_LOGGED_OUT = 1024
export const MAX_STEPS_LOGGED_IN = 500
export const MAX_IMAGE_PIXELS = 4194304 // Maximum supported resolution for image requests to the AI Horde
export const MIN_IMAGE_WIDTH = 64
export const POLL_COMPLETED_JOBS_INTERVAL = 1500 // ms

export const MAX_LORA_CACHE = 100
export const MAX_TI_CACHE = 100

export const CREATE_PAGE_PARAM = {
  Edit: 'edit',
  LoadDrawing: 'drawing',
  LoadModel: 'model',
  Prompt: 'prompt',
  Share: 'share',
  Shortlink: 'i'
}

export enum DEXIE_JOB_ID {
  SourceImage = '0',
  SourceMask = '1'
}

// TODO: Move into Samplers model file and add better ways to sort based on input type (txt2img vs img2img)
export const DEFAULT_SAMPLER_ARRAY = [
  'k_dpm_2_a',
  'k_dpm_2',
  'k_euler_a',
  'k_euler',
  'k_heun',
  'k_lms',
  'k_dpm_fast',
  'k_dpm_adaptive',
  'k_dpmpp_2m',
  'k_dpmpp_2s_a',
  'k_dpmpp_sde'
]

export const CONTROL_TYPE_ARRAY = [
  '',
  'canny',
  'hed',
  'depth',
  'normal',
  'openpose',
  'seg',
  'scribble',
  'fakescribbles',
  'hough'
]

export const MODEL_LIMITED_BY_WORKERS = 3

interface IQualityMap {
  [key: number]: number
}

// Stable Horde API does something silly where you rate image quality from best (0) to worst (5).
// Meanwhile, you rate images aesthetically from worst (1) to best (10). Lining these up is confusing
// and counter-intuitive.
export const RATING_QUALITY_MAP: IQualityMap = {
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
  6: 0
}

export const ORIENTATION_OPTIONS: Array<IOrientation> = [
  {
    value: 'landscape-16x9',
    label: 'Landscape (16 x 9)',
    width: 16,
    height: 9
  },
  { value: 'landscape', label: 'Landscape (3 x 2)', width: 3, height: 2 },
  { value: 'portrait', label: 'Portrait (2 x 3)', width: 2, height: 3 },
  {
    value: 'phone-bg',
    label: 'Phone background (9 x 21)',
    width: 9,
    height: 21
  },
  { value: 'ultrawide', label: 'Ultrawide (21 x 9)', width: 21, height: 9 },
  { value: 'square', label: 'Square', width: 1, height: 1 },
  { value: 'custom', label: 'Custom' },
  { value: 'random', label: 'Random!' }
]

export const zIndex = {
  DEFAULT: 1,
  OVER_BASE: 2, // e.g., Makes <Select /> menu dropdown appear above other select components
  NAV_BAR: 25,
  MODAL: 3,
  SLIDING_PANEL: 4,
  OVERLAY: 30
}
