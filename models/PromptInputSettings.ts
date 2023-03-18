import LocalStorageController from '../controllers/LocalStorageController'
import AppSettings from './AppSettings'

interface IOptions {
  forceSavePrompt?: boolean
}

class PromptInputSettingsClass extends LocalStorageController {
  constructor({ name, version }: { name: string; version: number }) {
    super({ name, version })
  }

  saveAllInput(input: object = {}, options: IOptions = {}) {
    const { forceSavePrompt = false } = options

    const clonedInput = Object.assign({}, input)

    // Clone to prompt input settings
    const keysToExclude = [
      'canvasData',
      'canvasStore',
      'copyPrompt',
      'maskData',
      'parentJobId',
      'source_image',
      'source_mask'
    ]

    interface IKeyValue {
      [key: string]: string
    }

    const keysToRemap: IKeyValue = {
      orientation: 'orientationType'
    }

    for (let [key, value] of Object.entries(clonedInput)) {
      if (keysToExclude.includes(key)) {
        continue
      }

      if (
        key === 'prompt' &&
        !AppSettings.get('savePromptOnCreate') &&
        !forceSavePrompt
      ) {
        continue
      }

      if (key === 'seed' && !AppSettings.get('saveSeedOnCreate')) {
        continue
      }

      if (keysToRemap[key]) {
        key = keysToRemap[key]
      }

      if (key === 'numImages') {
        this.set(key, 1)
        continue
      }

      this.set(key, value)
    }
  }
}

const PromptInputSettings = new PromptInputSettingsClass({
  name: 'PromptInputSettings',
  version: 1
})

PromptInputSettings.init()

export default PromptInputSettings
