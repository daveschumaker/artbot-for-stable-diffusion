interface IControllerParams {
  name: string
  version?: number
}

class LocalStorageController {
  localStorageKey: string
  version: number

  constructor(params: IControllerParams) {
    const { name = '', version = 1 } = params

    this.localStorageKey = String(name)
    this.version = Number(version)
  }

  init() {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.load()) {
      localStorage.setItem(this.localStorageKey, '')
    }
  }

  clear() {
    localStorage.setItem(this.localStorageKey, '')
  }

  delete(key: string) {
    if (typeof window === 'undefined') {
      return
    }

    const data = this.load()
    delete data[key]
    this.saveAll(data)
  }

  get(item: string) {
    if (typeof window === 'undefined') {
      return
    }

    const data = this.load()

    if (data && data[item] && data[item] === 'true') {
      return true
    } else if (data && data[item] && data[item] === 'false') {
      return false
    } else {
      return false
    }

    return data[item]
  }

  load() {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const string = localStorage.getItem(this.localStorageKey) || ''

      if (!string) {
        return
      }

      const data = JSON.parse(string)

      return data
    } catch (err) {
      return
    }
  }

  save(key: string, val: any = '') {
    if (typeof window === 'undefined') {
      return
    }

    if (!key) {
      return
    }

    const data = this.load() || {}
    data[key] = val
    this.saveAll(data)
  }

  // NOTE: Does the same thing as "save" but more inline with getter / setter API.
  set(key: string, val: any = '') {
    this.save(key, val)
  }

  saveAll(params: any) {
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Save version in case we update params at a later time.
      const data = { v: this.version, ...params }
      const string = JSON.stringify(data)
      localStorage.setItem(this.localStorageKey, string)
    } catch (err) {
      console.warn(
        `Error attempting to write to locale storage for key of "${this.localStorageKey}"`
      )
      localStorage.setItem(this.localStorageKey, '{}')
    }
  }

  reset() {
    this.clear()
  }
}

export default LocalStorageController
