import { setAvailableModels } from '../store/appStore'
import { DiffusionModel, ModelDetails } from '../types'

interface ModelsCache {
  [key: string]: number
}

const modelsCache: ModelsCache = {}

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

  isPending = true
  let availableModels: Array<ModelDetails> = []

  try {
    const res = await fetch(`https://stablehorde.net/api/v2/status/models`)
    const modelDetails: Array<DiffusionModel> = await res.json()

    if (Array.isArray(modelDetails)) {
      modelDetails.sort(compare)
      modelDetails.forEach((model) => {
        modelsCache[model.name] = model.count

        if (model.name === 'stable_diffusion_inpainting') {
          return
        }

        availableModels.push({
          name: model.name,
          count: model.count
        })
      })
    }

    // @ts-ignore
    setAvailableModels(availableModels)
  } catch (err) {
    availableModels.push({
      name: 'stable_diffusion'
    })
  }

  isPending = false
  return {
    success: true
  }
}
