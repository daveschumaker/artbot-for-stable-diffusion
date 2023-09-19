import LocalStorageController from 'app/_controllers/LocalStorageController'

const CanvasSettings = new LocalStorageController({
  name: 'CanvasSettings',
  version: 1
})

CanvasSettings.init()

export default CanvasSettings
