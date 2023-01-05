import StableDiffusionModel from '../models/StableDiffusionModel'
import { setAvailableModels } from '../store/modelStore'
import { isAppActive } from '../utils/appUtils'
import fetchModelDetails from './fetchModelDetails'

let isInitial = true
let isPending = false

export const fetchAvailableModels = async () => {
  if (isPending) {
    return
  }

  if (!isAppActive()) {
    return
  }

  isPending = true

  let availableModels = [
    new StableDiffusionModel({
      name: 'stable_diffusion',
      count: 1
    })
  ]

  try {
    const res = await fetch(
      isInitial
        ? `/artbot/api/models-available`
        : `https://stablehorde.net/api/v2/status/models`
    )
    const data = await res.json()

    if (Array.isArray(data)) {
      data.forEach((model) => {
        availableModels.push(new StableDiffusionModel({ ...model }))
      })
    } else {
      availableModels = data.models
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch available models. API offline?`)
  } finally {
    isPending = false
    isInitial = false

    return availableModels
  }
}

export const buildModelAvailability = async () => {
  let modelAvailability = []
  const availableModelsMap = (await fetchModelDetails()) || {}
  try {
    modelAvailability = (await fetchAvailableModels()) || []

    modelAvailability?.forEach((model) => {
      availableModelsMap[model.name] = { ...model }
    })
  } catch (err) {
    // If nothing happens here, ignore it for now.
  } finally {
    if (modelAvailability.length > 0) {
      setAvailableModels(availableModelsMap)
    }
  }
}
