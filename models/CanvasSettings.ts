import LocalStorageController from '../controllers/LocalStorageController'

const CanvasSettings = new LocalStorageController({
  name: 'CanvasSettings',
  version: 1
})

CanvasSettings.init()

export default CanvasSettings
