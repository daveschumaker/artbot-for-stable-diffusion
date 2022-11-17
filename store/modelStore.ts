import { makeStore } from 'statery'

interface ModelStore {
  availableModelNames: Array<string>
  availableModels: Array<AvailableModel>
  modelDetails: IModelsDetails
  sort: string
}

export interface AvailableModel {
  count: number
  eta: number
  name: string
  performance: number
  queued: number
}

export interface IModelsDetails {
  [key: string]: IModelDetails
}

export interface IModelDetails {
  description: string
  homepage: string
  name: string
  nsfw: boolean
  style: string
  trigger?: string
  type: string
  version: string
}

export const modelInfoStore = makeStore<ModelStore>({
  availableModelNames: [],
  availableModels: [],
  modelDetails: {},
  sort: 'count'
})

export const setAvailableModels = (models: Array<AvailableModel>) => {
  // handle issue where API times out after already using web-app.
  // error would overwrite existing models.
  if (modelInfoStore.state.availableModels.length > 1 && models.length <= 1) {
    return
  }

  modelInfoStore.set(() => ({
    availableModelNames: models?.map((model) => model.name),
    availableModels: [...models]
  }))
}

export const setModelDetails = (models: IModelsDetails) => {
  // handle issue where API times out after already using web-app.
  // error would overwrite existing models.
  if (
    Object.keys(modelInfoStore.state.modelDetails).length > 1 &&
    Object.keys(models).length <= 1
  ) {
    return
  }

  modelInfoStore.set(() => ({
    modelDetails: Object.assign({}, models)
  }))
}
