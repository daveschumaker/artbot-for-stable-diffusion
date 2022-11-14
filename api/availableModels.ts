import { setAvailableModels } from '../store/appStore'
import { DiffusionModel, ModelDetails } from '../types'

interface ModelsCache {
  [key: string]: number
}

let currentModelNames: Array<string> = [] // Used to pull random model name
const modelsCache: ModelsCache = {}

export const getCurrentModels = () => {
  return currentModelNames
}

export const getModelsCache = () => {
  return modelsCache
}

function compare(a: DiffusionModel, b: DiffusionModel) {
  if (a.count < b.count) {
    return 1
  }
  if (a.count > b.count) {
    return -1
  }
  return 0
}

let isPending = false
export const fetchAvailableModels = async () => {
  if (isPending) {
    return
  }

  if (document.visibilityState !== 'visible') {
    return
  }

  isPending = true
  let availableModels: Array<ModelDetails> = []
  let availableModelNames: Array<string> = []

  try {
    const res = await fetch(`https://stablehorde.net/api/v2/status/models`)
    const modelDetails: Array<DiffusionModel> = await res.json()

    if (Array.isArray(modelDetails) && modelDetails.length > 0) {
      modelDetails.sort(compare)
      modelDetails.forEach((model) => {
        modelsCache[model.name] = model.count

        if (model.name === 'stable_diffusion_inpainting') {
          return
        }

        availableModelNames.push(model.name)
        availableModels.push({
          name: model.name,
          count: model.count
        })
      })
    } else {
      availableModelNames.push('stable_diffusion')
      availableModels.push({
        name: 'stable_diffusion',
        count: 1
      })
    }

    // @ts-ignore
    setAvailableModels(availableModels)
  } catch (err) {
    availableModels.push({
      name: 'stable_diffusion',
      count: 1
    })
  }

  currentModelNames = [...availableModelNames]
  isPending = false
  return {
    success: true
  }
}
