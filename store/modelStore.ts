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
  homepage: string
  showcases: Array<string>
  name: string
  nsfw: boolean
  style: string
  trigger?: string
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
  // models.sort((a: IStableDiffusionModel, b: IStableDiffusionModel) => {
  //   if (typeof a.count === 'undefined' || isNaN(a.count)) {
  //     return 0
  //   }

  //   if (typeof b.count === 'undefined' || isNaN(b.count)) {
  //     return 0
  //   }

  //   if (a.count < b.count) {
  //     return 1
  //   }
  //   if (a.count > b.count) {
  //     return -1
  //   }
  //   return 0
  // })

  // let inpaintingWorkers = 0
  // const availableModels = models.filter((model) => {
  //   if (model.name === 'stable_diffusion_inpainting') {
  //     inpaintingWorkers = model.count
  //     return false
  //   }

  //   return true
  // })

  modelInfoStore.set(() => ({
    // availableModelNames: availableModels?.map((model) => model.name),
    availableModels: { ...models }
    // inpaintingWorkers
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
