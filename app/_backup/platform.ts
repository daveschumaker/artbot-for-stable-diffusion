export const SELECTION_KEY = 'ArtBotLibrarySelection'
export const OPERATION_KEY = `${SELECTION_KEY}:operation`
export interface Selection {
  name: string
  generation: string
  appConfig?: Record<string, unknown>
  localPreferences?: Record<string, string>
  previousName?: string
  restoreId?: string
  jobsPaused?: boolean
}
export const browserStorage = () =>
  typeof localStorage === 'undefined' ? undefined : localStorage
export function selection(
  storage = browserStorage(),
  key = SELECTION_KEY
): Selection | undefined {
  const value = storage?.getItem(key)
  if (!value) return undefined
  const parsed = JSON.parse(value)
  if (
    !parsed ||
    typeof parsed.name !== 'string' ||
    !parsed.name ||
    parsed.name.length > 200 ||
    typeof parsed.generation !== 'string'
  )
    throw new Error('Invalid selected ArtBot library')
  return parsed
}
export function readPreferences(
  storage = browserStorage(),
  key = SELECTION_KEY
): Record<string, unknown> {
  const chosen = selection(storage, key)
  if (chosen?.appConfig) return chosen.appConfig
  try {
    return JSON.parse(storage?.getItem('appConfig') || '{}')
  } catch {
    return {}
  }
}
export function writePreferences(
  value: Record<string, unknown>,
  storage = browserStorage(),
  key = SELECTION_KEY
) {
  if (!storage) return
  const chosen = selection(storage, key)
  storage.setItem(
    chosen?.appConfig ? key : 'appConfig',
    JSON.stringify(chosen?.appConfig ? { ...chosen, appConfig: value } : value)
  )
}
let windowId: string | undefined
export function backupWindowId() {
  return (
    windowId ||
    (windowId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.random()))
  )
}
export function backupBusy(storage = browserStorage(), key = OPERATION_KEY) {
  try {
    if (storage?.getItem(key.replace(/:operation$/, ':transition'))) return true
    const lock = JSON.parse(storage?.getItem(key) || 'null')
    return !!lock && lock.expires > Date.now()
  } catch {
    return false
  }
}
export function restoredJobsPaused() {
  return selection()?.jobsPaused === true
}
export function assertLibraryWritable(database?: string) {
  if (backupBusy())
    throw new Error(
      'A backup or restore is in progress. Please wait before changing this library.'
    )
  if (database && selection()?.name && selection()?.name !== database)
    throw new Error(
      'The selected library changed. Reload this window before making changes.'
    )
}
export function pauseRestoredJobs(paused: boolean) {
  const store = browserStorage()
  const chosen = selection(store)
  if (store && chosen)
    store.setItem(
      SELECTION_KEY,
      JSON.stringify({ ...chosen, jobsPaused: paused })
    )
}

// User-authored and display preferences that live outside appConfig. Runtime
// ownership/heartbeat/debug keys deliberately have no entry in this allowlist.
export const PERSISTENT_KEYS = [
  'favoriteLoras',
  'recentLoras',
  'favoriteEmbeddings',
  'recentEmbeddings',
  'controlnetPageInput',
  'PromptInputSettings',
  'imagePageSort',
  'showLayout',
  'theme',
  'CanvasSettings',
  'CustomDimensions',
  'img2img_base64'
] as const
export function readLocalPreferences(
  storage = browserStorage(),
  key = SELECTION_KEY
): Record<string, string> {
  const selected = selection(storage, key)
  if (selected?.localPreferences) return selected.localPreferences
  return Object.fromEntries(
    PERSISTENT_KEYS.flatMap((name) => {
      const value = storage?.getItem(name)
      return value == null ? [] : [[name, value]]
    })
  )
}
export function preferenceStorage(
  storage = browserStorage(),
  key = SELECTION_KEY
) {
  const allowed = (name: string) => {
    if (!(PERSISTENT_KEYS as readonly string[]).includes(name))
      throw new Error(`Unknown persistent preference: ${name}`)
  }
  const change = (name: string, value: string | null) => {
    allowed(name)
    if (backupBusy(storage, `${key}:operation`))
      throw new Error(
        'A backup or restore is in progress. Wait before changing preferences.'
      )
    const selected = selection(storage, key)
    if (selected?.localPreferences) {
      const values = { ...readLocalPreferences(storage, key) }
      if (value === null) delete values[name]
      else values[name] = value
      storage?.setItem(
        key,
        JSON.stringify({ ...selected, localPreferences: values })
      )
    } else if (value === null) storage?.removeItem(name)
    else storage?.setItem(name, value)
  }
  return {
    getItem: (name: string) => {
      allowed(name)
      return readLocalPreferences(storage, key)[name] ?? null
    },
    setItem: (name: string, value: string) => change(name, String(value)),
    removeItem: (name: string) => change(name, null)
  }
}
// Access browserStorage lazily so importing a client module during SSR is safe.
export const libraryStorage = {
  getItem: (name: string) => preferenceStorage().getItem(name),
  setItem: (name: string, value: string) =>
    preferenceStorage().setItem(name, value),
  removeItem: (name: string) => preferenceStorage().removeItem(name),
  clear: () => {
    assertLibraryWritable()
    const storage = browserStorage(),
      selected = selection(storage)
    if (selected?.appConfig || selected?.localPreferences)
      storage?.setItem(
        SELECTION_KEY,
        JSON.stringify({
          ...selected,
          appConfig: { v: '1' },
          localPreferences: {}
        })
      )
    else {
      for (const key of PERSISTENT_KEYS) storage?.removeItem(key)
      storage?.setItem('appConfig', JSON.stringify({ v: '1' }))
    }
  }
}
