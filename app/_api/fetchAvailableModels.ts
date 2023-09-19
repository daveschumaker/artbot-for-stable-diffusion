import { basePath } from 'BASE_PATH'
import StableDiffusionModel from 'app/_data-models/StableDiffusionModel'
import { modelStore, setAvailableModels } from 'app/_store/modelStore'
import { clientHeader, isAppActive } from 'app/_utils/appUtils'
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
        ? `${basePath}/api/models-available`
        : `https://aihorde.net/api/v2/status/models`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
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
    // isInitial = false

    return availableModels
  }
}

export const buildModelAvailability = async () => {
  let modelAvailability: any = []
  const availableModelsMap = (await fetchModelDetails()) || {}
  try {
    modelAvailability = (await fetchAvailableModels()) || []

    modelAvailability?.forEach((model: any) => {
      availableModelsMap[model.name] = { ...model }
    })
  } catch (err) {
    // If nothing happens here, ignore it for now.
  } finally {
    const currentModelCount = Object.keys(
      modelStore.state.availableModels
    ).length

    const validCount = currentModelCount > 1 && modelAvailability.length > 1

    if (validCount || currentModelCount === 0) {
      // @ts-ignore
      setAvailableModels(modelAvailability)
    }
  }
}
