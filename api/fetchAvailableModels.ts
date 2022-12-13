import { setAvailableModels } from '../store/modelStore'
import { isAppActive } from '../utils/appUtils'

let isInitial = true
let isPending = false
const fetchAvailableModels = async () => {
  if (isPending) {
    return
  }

  if (!isAppActive()) {
    return
  }

  isPending = true

  let availableModels = [
    {
      name: 'stable_diffusion',
      count: 1,
      eta: 0,
      performance: 0,
      queued: 0
    }
  ]

  try {
    const res = await fetch(
      isInitial
        ? `/artbot/api/models-available`
        : `https://stablehorde.net/api/v2/status/models`
    )
    const data = await res.json()

    if (Array.isArray(data)) {
      availableModels = [...data]
    } else {
      availableModels = data.models
    }

    setAvailableModels(availableModels)
  } catch (err) {
    console.log(`Warning: Unable to fetch available models. API offline?`)
  } finally {
    isPending = false
    isInitial = false
  }
}

export default fetchAvailableModels
