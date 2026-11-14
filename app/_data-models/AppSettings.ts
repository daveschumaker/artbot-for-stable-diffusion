import { SETTINGS_DEFAULTS, settingsValues } from './settingsSchema'
import {
  assertLibraryWritable,
  browserStorage,
  selection,
  readPreferences,
  writePreferences
} from 'app/_backup/platform'

export const SETTINGS_EVENT = 'artbot-settings-changed'

interface IAppSettingsParams {
  allowNsfwImages: boolean
  apiKey: string
  runInBackground: boolean
  saveInputOnCreate: boolean
  useBeta: boolean
  useTrusted: boolean
}

class AppSettings {
  allowNsfwImages: boolean
  apiKey: string
  runInBackground: boolean
  saveInputOnCreate: boolean
  useBeta: boolean
  useTrusted: boolean

  constructor(params: IAppSettingsParams) {
    const {
      allowNsfwImages = false,
      apiKey = '',
      runInBackground = false,
      saveInputOnCreate = false,
      useBeta = false,
      useTrusted = true
    } = params

    this.allowNsfwImages = Boolean(allowNsfwImages)
    this.apiKey = String(apiKey)
    this.runInBackground = Boolean(runInBackground)
    this.saveInputOnCreate = Boolean(saveInputOnCreate)
    this.useBeta = Boolean(useBeta)
    this.useTrusted = Boolean(useTrusted)
  }

  static delete(key: string) {
    const data = this.readForUpdate()
    delete data[key]
    this.saveAll(data)
  }

  static get(item: string) {
    const data = this.load()

    return Object.hasOwn(SETTINGS_DEFAULTS, item)
      ? settingsValues(data)[item as keyof typeof SETTINGS_DEFAULTS]
      : data[item]
  }

  static load(): Record<string, any> {
    try {
      return readPreferences()
    } catch (err) {
      return {}
    }
  }

  static save(key: string, val: any) {
    const data = this.readForUpdate()
    data[key] = val
    this.saveAll(data)
  }

  // NOTE: Does the same thing as "save" but more inline with getter / setter API.
  static set(key: string, val: any) {
    this.save(key, val)
  }

  static readForUpdate(): Record<string, any> {
    const storage = browserStorage()
    if (!storage) throw new Error('Browser storage is unavailable')
    const selected = selection(storage)
    if (selected?.appConfig) return selected.appConfig
    const data = JSON.parse(storage.getItem('appConfig') || '{}')
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new Error(
        'Stored settings could not be read. Restore a backup before changing them.'
      )
    return data
  }

  static saveAll(params: Record<string, any>) {
    assertLibraryWritable()
    // Failed writes must never replace existing settings with an empty object.
    writePreferences({ v: '1', ...params })
    if (typeof window !== 'undefined')
      window.dispatchEvent(new Event(SETTINGS_EVENT))
  }
}

export default AppSettings
