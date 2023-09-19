import { makeStore } from 'statery'
import { IModelsDetails, ModelStore } from '_types/artbot'

export const modelStore = makeStore<ModelStore>({
  availableModelNames: [],
  availableModels: {},
  inpaintingWorkers: 0,
  modelDetails: {},
  sort: 'count'
})

export const setAvailableModels = (models: Array<any> = []) => {
  const modelNames: string[] = []
  const modelsMap: any = {}

  if (!Array.isArray(models)) return

  models.forEach((model: any) => {
    modelsMap[model.name] = model
    modelNames.push(model.name)
  })

  modelNames.sort()
  const currentModelCount = models.length

  if (currentModelCount > 1) {
    modelStore.set(() => ({
      availableModelNames: modelNames,
      availableModels: { ...models }
    }))
  }
}

export const setModelDetails = (models: IModelsDetails) => {
  // handle issue where API times out after already using web-app.
  // error would overwrite existing models.
  if (
    Object.keys(modelStore.state.modelDetails).length > 1 &&
    Object.keys(models).length <= 1
  ) {
    return
  }

  modelStore.set(() => ({
    modelDetails: Object.assign({}, models)
  }))
}
