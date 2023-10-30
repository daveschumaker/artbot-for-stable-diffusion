import { debounce } from 'app/_utils/debounce'
import { getSettingFromDexie, updateSetting } from 'app/_db/settings'
import DefaultPromptInput from './DefaultPromptInput'

class PromptInputSettingsClass {
  saveAllInput = debounce(async (input: object = {}) => {
    const clonedInput = Object.assign({}, input)

    // Clone to prompt input settings
    const keysToExclude = [
      'canvasStore', // DEPRECATED
      // 'canvasData',
      // 'copyPrompt',
      'parentJobId'
      // 'source_image',
      // 'source_mask'
    ]

    const filteredObject = Object.keys(clonedInput)
      .filter((key) => !keysToExclude.includes(key))
      .reduce((acc, key) => {
        // @ts-ignore
        acc[key] = clonedInput[key]
        return acc
      }, {})

    try {
      await updateSetting('promptInput', filteredObject)
    } catch (e) {
      console.log(`Error:`, e)
    }
  }, 350)

  delete = async (name: string) => {
    console.log(`delete?`, name)
  }

  get = async (name: string) => {
    console.log(`get?`, name)
  }

  load = async () => {
    try {
      const res = (await getSettingFromDexie('promptInput')) || []
      const [obj = {}] = res
      const { setting = {} } = obj
      console.log(`loaded?`, setting)
      return new DefaultPromptInput(setting)
    } catch (e) {
      console.log(`Error:`, e)
      return new DefaultPromptInput()
    }
  }
}

const PromptInputSettings = new PromptInputSettingsClass()
export default PromptInputSettings
