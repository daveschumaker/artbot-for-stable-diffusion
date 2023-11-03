import { debounce } from 'app/_utils/debounce'
import {
  SettingName,
  getSettingFromDexie,
  updateSetting
} from 'app/_db/settings'
import DefaultPromptInput from './DefaultPromptInput'

class PromptInputSettingsClass {
  updateSavedInput_NON_DEBOUNCED = async (
    input: DefaultPromptInput = {} as DefaultPromptInput
  ) => {
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
      await updateSetting(SettingName.PromptInput, filteredObject)
    } catch (e) {
      console.log(`Error:`, e)
    }
  }

  saveAllInput = debounce(this.updateSavedInput_NON_DEBOUNCED, 350)

  delete = async (name: string) => {
    const data: { [key: string]: any } = await this.load()
    delete data[name]
    this.updateSavedInput_NON_DEBOUNCED(data as DefaultPromptInput)
  }

  get = async (name: string) => {
    console.log(`get?`, name)
  }

  load = async (): Promise<DefaultPromptInput> => {
    try {
      const res = (await getSettingFromDexie(SettingName.PromptInput)) || []
      const { setting = {} } = res
      return new DefaultPromptInput(setting)
    } catch (e) {
      console.log(`Error:`, e)
      return new DefaultPromptInput()
    }
  }
}

const PromptInputSettings = new PromptInputSettingsClass()
export default PromptInputSettings
