import { makeStore } from 'statery'

interface ModelStore {
  availableModelNames: Array<string>
  availableModels: Array<AvailableModel>
  modelDetails: IModelsDetails
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
  modelDetails: {}
})

export const setAvailableModels = (models: Array<AvailableModel>) => {
  modelInfoStore.set(() => ({
    availableModelNames: models?.map((model) => model.name),
    availableModels: [...models]
  }))
}

export const setModelDetails = (models: IModelsDetails) => {
  modelInfoStore.set(() => ({
    modelDetails: Object.assign({}, models)
  }))
}
