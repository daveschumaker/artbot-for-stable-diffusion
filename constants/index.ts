export const ANON_API_KEY = '0000000000'
export const HORDE_PROD = 'https://stablehorde.net'
export const HORDE_DEV = 'https://dev.stablehorde.net'
export const CREATE_NEW_JOB_INTERVAL = 1000 // ms between new job requests
export const RATE_IMAGE_CUTOFF_SEC = 900
export const MAX_CONCURRENT_JOBS_ANON = 3
export const MAX_CONCURRENT_JOBS_USER = 5
export const MAX_IMAGES_PER_JOB = 200
export const MAX_DIMENSIONS_LOGGED_IN = 2048
export const MAX_DIMENSIONS_LOGGED_OUT = 1024
export const POLL_COMPLETED_JOBS_INTERVAL = 2500 // ms
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
  'k_dpmpp_2s_a'
]

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
