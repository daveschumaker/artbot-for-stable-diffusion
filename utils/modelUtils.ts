import { modelInfoStore } from '../store/modelStore'

// Hide things like inpainting models and other things we don't care for.
export const validModelsArray = (sort = 'workers') => {
  const modelsArray = []
  const availableModels = modelInfoStore.state.availableModels || {}

  for (const key in availableModels) {
    if (availableModels[key].name === 'stable_diffusion_inpainting') {
      continue
    }

    if (availableModels[key].name === 'stable_diffusion_1.4') {
      continue
    }

    modelsArray.push({
      name: availableModels[key].name,
      value: availableModels[key].name,
      label: `${availableModels[key].name} (${availableModels[key].count})`,
      count: availableModels[key].count
    })

    if (sort === 'workers') {
      modelsArray.sort((a, b) => {
        if (typeof a.count === 'undefined' || isNaN(a.count)) {
          return 0
        }

        if (typeof b.count === 'undefined' || isNaN(b.count)) {
          return 0
        }

        if (a.count < b.count) {
          return 1
        }
        if (a.count > b.count) {
          return -1
        }
        return 0
      })
    }
  }

  return modelsArray
}
