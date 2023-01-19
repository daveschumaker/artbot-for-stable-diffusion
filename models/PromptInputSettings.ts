import LocalStorageController from '../controllers/LocalStorageController'

const PromptInputSettings = new LocalStorageController({
  name: 'PromptInputSettings',
  version: 1
})

PromptInputSettings.init()

export default PromptInputSettings
