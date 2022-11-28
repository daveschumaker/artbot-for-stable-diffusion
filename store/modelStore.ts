import { makeStore } from 'statery'

interface ModelStore {
  availableModelNames: Array<string>
  availableModels: Array<AvailableModel>
  modelDetails: IModelsDetails
  inpaintingWorkers: number
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
  availableModels: [],
  inpaintingWorkers: 0,
  modelDetails: {},
  sort: 'count'
})

export const setAvailableModels = (models: Array<AvailableModel>) => {
  // handle issue where API times out after already using web-app.
  // error would overwrite existing models.
  if (modelInfoStore.state.availableModels.length > 1 && models.length <= 1) {
    return
  }

  models.sort((a, b) => {
    if (a.count < b.count) {
      return 1
    }
    if (a.count > b.count) {
      return -1
    }
    return 0
  })

  let inpaintingWorkers = 0
  const availableModels = models.filter((model) => {
    if (model.name === 'stable_diffusion_inpainting') {
      inpaintingWorkers = model.count
      return false
    }

    return true
  })

  modelInfoStore.set(() => ({
    availableModelNames: availableModels?.map((model) => model.name),
    availableModels,
    inpaintingWorkers
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
