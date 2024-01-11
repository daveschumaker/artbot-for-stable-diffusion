import { SourceProcessing } from '_types/horde'
import { modelStore } from 'app/_store/modelStore'
import AppSettings from './AppSettings'
import DefaultPromptInput from './DefaultPromptInput'

class ImageModels {
  static getModelVersion = (modelName: string) => {
    const { modelDetails } = modelStore.state

    if (modelDetails[modelName]) {
      return modelDetails[modelName].version || ''
    }
  }

  static getValidModels = ({
    input,
    sort = 'workers',
    filterNsfw = false,
    showHidden = false
  }: {
    input: DefaultPromptInput
    sort?: string
    filterNsfw?: boolean
    showHidden?: boolean
  }) => {
    let { availableModels, modelDetails } = modelStore.state
    const hidden = AppSettings.get('hiddenModels') || {}
    const modelsArray: Array<any> = []

    const isImg2Img =
      input.source_image ||
      input.source_processing === SourceProcessing.Img2Img ||
      input.source_processing === SourceProcessing.InPainting
    const isInpainting = input.source_image || input.source_mask ? true : false

    for (const [key] of Object.entries(availableModels)) {
      const modelName = availableModels[key].name
      if (
        filterNsfw &&
        modelDetails &&
        modelDetails[modelName] &&
        modelDetails[modelName]?.nsfw === true
      ) {
        continue
      }

      // Temporarily (permanently) removing this. We should go ahead and show all models.
      // Show a relevant warning in the UI when selected and user is missing a source mask
      // https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/65
      // if (
      //   availableModels[key].name === 'stable_diffusion_inpainting' &&
      //   inpainting === false
      // ) {
      //   continue
      // }

      // pix2pix cannot do txt2img.
      if (availableModels[key].name === 'pix2pix' && !input.source_image) {
        continue
      }

      // Per Discord, stable_diffusion_2.0 cannot do img2img.
      if (
        availableModels[key].name === 'stable_diffusion_2.0' &&
        (isImg2Img !== false || isInpainting !== false)
      ) {
        continue
      }

      // Per Discord, SDXL_beta cannot do img2img.
      if (
        availableModels[key].name.includes === 'SDXL_beta' &&
        (isImg2Img !== false || isInpainting !== false)
      ) {
        continue
      }

      // Per Discord, stable_diffusion_2.0 cannot do img2img.
      if (
        availableModels[key].name === 'stable_diffusion_2.0' &&
        (isImg2Img !== false || isInpainting !== false)
      ) {
        continue
      }

      // Depth2Image cannot do text2img
      if (
        availableModels[key].name === 'Stable Diffusion 2 Depth' &&
        isImg2Img !== true
      ) {
        continue
      }

      // Per Discord, stable_diffusion_2.1 cannot do inpainting.
      if (
        availableModels[key].name === 'stable_diffusion_2.1' &&
        isInpainting !== false
      ) {
        continue
      }

      // This model is borked and we should never ever show it.
      if (availableModels[key].name === 'stable_diffusion_1.4') {
        continue
      }

      let displayName = availableModels[key].name
      if (availableModels[key].name === 'stable_diffusion_inpainting') {
        displayName = 'Stable Diffusion v1.5 Inpainting'
      }

      if (
        !isInpainting &&
        availableModels[key].name.toLowerCase().includes('inpainting')
      ) {
        continue
      }

      if (hidden[availableModels[key].name] && !showHidden) {
        continue
      }

      modelsArray.push({
        name: availableModels[key].name,
        value: availableModels[key].name,
        label: `${displayName} (${availableModels[key].count})`,
        count: availableModels[key].count
      })

      if (sort === 'workers') {
        modelsArray.sort((a: any, b: any) => {
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

  static dropdownOptions = ({
    filteredModels = []
  }: {
    filteredModels: Array<any>
  }) => {
    filteredModels.push({
      name: 'random',
      value: 'random',
      label: 'Random!',
      count: 1
    })

    return filteredModels
  }

  static dropdownValue = (input: DefaultPromptInput) => {
    const { models } = input
    const [model] = models

    // TODO: Update to match nice display name present in getValidModels
    // return models.map((model) => {
    return { label: model, value: model }
    // })
  }
}

export default ImageModels
