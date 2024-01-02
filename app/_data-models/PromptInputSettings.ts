import { debounce } from 'app/_utils/debounce'
import {
  SettingName,
  getSettingFromDexie,
  updateSetting
} from 'app/_db/settings'
import DefaultPromptInputV2 from './v2/DefaultPromptInputV2'

class PromptInputSettingsClass {
  updateSavedInput_NON_DEBOUNCED = async (
    input: DefaultPromptInputV2 = {} as DefaultPromptInputV2
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
    this.updateSavedInput_NON_DEBOUNCED(data as DefaultPromptInputV2)
  }

  get = async (name: string) => {
    console.log(`get?`, name)
  }

  load = async (): Promise<DefaultPromptInputV2> => {
    try {
      const res = (await getSettingFromDexie(SettingName.PromptInput)) || []
      const { setting = {} } = res
      return new DefaultPromptInputV2(setting)
    } catch (e) {
      console.log(`Error:`, e)
      return new DefaultPromptInputV2()
    }
  }
}

const PromptInputSettings = new PromptInputSettingsClass()
export default PromptInputSettings
