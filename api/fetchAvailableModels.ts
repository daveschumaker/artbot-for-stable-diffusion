import { setAvailableModels } from '../store/modelStore'
import { isAppActive } from '../utils/appUtils'

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
    const res = await fetch(`/artbot/api/models-available`)
    const data = await res.json()
    availableModels = data.models
  } catch (err) {
    console.log(`Warning: Unable to fetch available models. API offline?`)
  } finally {
    isPending = false
    setAvailableModels(availableModels)
  }
}

export default fetchAvailableModels
