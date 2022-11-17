import { AvailableModel, setAvailableModels } from '../store/modelStore'

let isPending = false
const fetchAvailableModels = async () => {
  if (isPending) {
    return
  }

  if (document.visibilityState !== 'visible') {
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
    const res = await fetch(`https://stablehorde.net/api/v2/status/models`)
    const modelDetails: Array<AvailableModel> = await res.json()

    if (Array.isArray(modelDetails) && modelDetails.length > 0) {
      modelDetails.sort((a, b) => {
        if (a.count < b.count) {
          return 1
        }
        if (a.count > b.count) {
          return -1
        }
        return 0
      })

      availableModels = modelDetails.filter((model) => {
        // Stable Diffusion Inpainting shouldn't appear in our model dropdown
        if (model.name === 'stable_diffusion_inpainting') {
          return false
        }

        return true
      })
    }
  } finally {
    isPending = false
    setAvailableModels(availableModels)
  }
}

export default fetchAvailableModels
