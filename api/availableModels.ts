import { setAvailableModels } from '../store/appStore'
import { DiffusionModel } from '../types'

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
  let availableModels: Array<string> = []

  try {
    const res = await fetch(`https://stablehorde.net/api/v2/status/models`)
    const modelDetails: Array<DiffusionModel> = await res.json()

    if (Array.isArray(modelDetails)) {
      modelDetails.sort(compare)
      modelDetails.forEach((model) => {
        availableModels.push(model.name)
      })
    }

    setAvailableModels(availableModels)
  } catch (err) {
    availableModels.push('stable_diffusion')
  }

  isPending = false
  return {
    success: true
  }
}
