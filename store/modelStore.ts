import { makeStore } from 'statery'
import { IStableDiffusionModel } from '../models/StableDiffusionModel'

interface ModelStore {
  availableModelNames: Array<string>
  availableModels: IAvailableModels
  modelDetails: IModelsDetails
  inpaintingWorkers: number
  sort: string
}

export interface IAvailableModels {
  [key: string]: IStableDiffusionModel
}

export interface IModelsDetails {
  [key: string]: IModelDetails
}

export interface IModelDetails {
  description: string
  baseline: string
  homepage: string
  showcases: Array<string>
  name: string
  nsfw: boolean
  style: string
  trigger?: Array<string>
  type: string
  version: string
}

export const modelInfoStore = makeStore<ModelStore>({
  availableModelNames: [],
  availableModels: {},
  inpaintingWorkers: 0,
  modelDetails: {},
  sort: 'count'
})

export const setAvailableModels = (models: {
  [key: string]: IStableDiffusionModel
}) => {
  modelInfoStore.set(() => ({
    availableModels: { ...models }
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
