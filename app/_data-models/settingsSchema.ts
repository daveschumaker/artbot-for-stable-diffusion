export interface WorkerPreference {
  label: string
  value: string
  timestamp?: string
}
export interface SettingsValues {
  apiKey: string
  theme: 'light' | 'dark' | 'system'
  imageDownloadFormat: 'jpg' | 'png' | 'webp'
  imagesPerPage: number
  maxConcurrency: number
  useTrusted: boolean
  slow_workers: boolean
  allowNsfwImages: boolean
  savePromptOnCreate: boolean
  saveSeedOnCreate: boolean
  saveCanvasOnCreate: boolean
  stayOnCreate: boolean
  runInBackground: boolean
  enableGallerySwipe: boolean
  disableNewImageNotification: boolean
  useAllowedWorkers: boolean
  useBlockedWorkers: boolean
  allowedWorkers: WorkerPreference[]
  blockedWorkers: WorkerPreference[]
}
export const SETTINGS_DEFAULTS: SettingsValues = {
  apiKey: '',
  theme: 'system',
  imageDownloadFormat: 'jpg',
  imagesPerPage: 50,
  maxConcurrency: 5,
  useTrusted: true,
  slow_workers: true,
  allowNsfwImages: false,
  savePromptOnCreate: false,
  saveSeedOnCreate: false,
  saveCanvasOnCreate: false,
  stayOnCreate: false,
  runInBackground: false,
  enableGallerySwipe: true,
  disableNewImageNotification: false,
  useAllowedWorkers: false,
  useBlockedWorkers: false,
  allowedWorkers: [],
  blockedWorkers: []
}
export function validSetting<K extends keyof SettingsValues>(
  key: K,
  value: unknown
): value is SettingsValues[K] {
  if (key === 'theme')
    return (
      typeof value === 'string' && ['system', 'light', 'dark'].includes(value)
    )
  if (key === 'imageDownloadFormat')
    return typeof value === 'string' && ['jpg', 'png', 'webp'].includes(value)
  if (key === 'imagesPerPage' || key === 'maxConcurrency')
    return (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= (key === 'maxConcurrency' ? 30 : 500)
    )
  if (key === 'apiKey') return typeof value === 'string'
  if (key === 'allowedWorkers' || key === 'blockedWorkers')
    return (
      Array.isArray(value) &&
      value.every(
        (worker) =>
          worker &&
          typeof worker.value === 'string' &&
          typeof worker.label === 'string'
      )
    )
  return typeof value === 'boolean'
}
// Invalid known values fall back for display/use; unknown stored fields are
// preserved by the write layer, so this does not migrate or rewrite old data.
export function settingsValues(raw: Record<string, unknown>): SettingsValues {
  return Object.fromEntries(
    Object.entries(SETTINGS_DEFAULTS).map(([key, fallback]) => {
      let value = raw[key]
      if (
        (key === 'allowedWorkers' || key === 'blockedWorkers') &&
        Array.isArray(value)
      )
        value = value.map((worker) =>
          worker && typeof worker === 'object'
            ? {
                ...worker,
                label:
                  typeof worker.label === 'string' ? worker.label : worker.value
              }
            : worker
        )
      return [
        key,
        validSetting(key as keyof SettingsValues, value) ? value : fallback
      ]
    })
  ) as unknown as SettingsValues
}
