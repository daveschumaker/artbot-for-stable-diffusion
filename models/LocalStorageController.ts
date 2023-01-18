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

  delete(key: string) {
    const data = this.load()
    delete data[key]
    this.saveAll(data)
  }

  get(item: string) {
    const data = this.load()

    if (data[item] === 'true') {
      return true
    } else if (data[item] === 'false') {
      return false
    }

    return data[item]
  }

  load() {
    try {
      const string = localStorage.getItem(this.localStorageKey) || ''
      const data = JSON.parse(string)

      return data
    } catch (err) {
      return {}
    }
  }

  save(key: string, val: any = '') {
    if (!key) {
      return
    }

    const data = this.load()
    data[key] = val
    this.saveAll(data)
  }

  // NOTE: Does the same thing as "save" but more inline with getter / setter API.
  set(key: string, val: any = '') {
    this.save(key, val)
  }

  saveAll(params: any) {
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
}

export default LocalStorageController
