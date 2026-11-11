import {
  assertLibraryWritable,
  readPreferences,
  writePreferences
} from 'app/_backup/platform'

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
    const data = this.load()
    delete data[key]
    this.saveAll(data)
  }

  static get(item: string) {
    const data = this.load()

    return data[item]
  }

  static load(): Record<string, any> {
    try {
      return readPreferences()
    } catch (err) {
      return {}
    }
  }

  static save(key: string, val: any) {
    const data = this.load()
    data[key] = val
    this.saveAll(data)
  }

  // NOTE: Does the same thing as "save" but more inline with getter / setter API.
  static set(key: string, val: any) {
    this.save(key, val)
  }

  static saveAll(params: Record<string, any>) {
    assertLibraryWritable()
    // Failed writes must never replace existing settings with an empty object.
    writePreferences({ v: '1', ...params })
  }
}

export default AppSettings
