import { modelInfoStore } from '../store/modelStore'
import { SourceProcessing } from './promptUtils'

export const getModelVersion = (modelName: string) => {
  if (modelInfoStore.state.modelDetails[modelName]) {
    return modelInfoStore.state.modelDetails[modelName].version || ''
  }

  return ''
}

// Hide things like inpainting models and other things we don't care for.
export const validModelsArray = ({
  imageParams = {
    source_mask: '',
    source_processing: SourceProcessing.Prompt
  },
  sort = 'workers'
} = {}) => {
  const img2img =
    imageParams.source_processing === SourceProcessing.Img2Img ||
    imageParams.source_processing === SourceProcessing.InPainting
  const inpainting = imageParams.source_mask ? true : false

  const modelsArray = []
  const availableModels =
    JSON.parse(JSON.stringify(modelInfoStore.state.availableModels)) || {}

  for (const key in availableModels) {
    if (
      availableModels[key].name === 'stable_diffusion_inpainting' &&
      inpainting === false
    ) {
      continue
    }

    // Per Discord, stable_diffusion_2.1 cannot do img2img.
    if (
      availableModels[key].name === 'stable_diffusion_2.1' &&
      (img2img !== false || inpainting !== false)
    ) {
      continue
    }

    // This model is borked and we shuld never ever show it.
    if (availableModels[key].name === 'stable_diffusion_1.4') {
      continue
    }

    let displayName = availableModels[key].name
    if (availableModels[key].name === 'stable_diffusion_inpainting') {
      displayName = 'Stable Diffusion v.2.0 Inpainting'
    }

    modelsArray.push({
      name: availableModels[key].name,
      value: availableModels[key].name,
      label: `${displayName} (${availableModels[key].count})`,
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
