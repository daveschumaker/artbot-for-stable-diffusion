import { IAvailableModels, IModelsDetails } from '_types/artbot'
import StableDiffusionModel from 'app/_data-models/StableDiffusionModel'
import { setModelDetails } from 'app/_store/modelStore'
import { isAppActive } from 'app/_utils/appUtils'
import { basePath } from 'BASE_PATH'

const fetchModelDetails = async () => {
  if (!isAppActive()) {
    return {
      success: false,
      status: 'App is not active'
    }
  }

  let modelDetails: IModelsDetails = {}
  let availableModelsMap: IAvailableModels = {}

  try {
    const res = await fetch(`${basePath}/api/models/details`)
    const { models }: { models: IModelsDetails } = await res.json()

    for (const model in models) {
      const {
        description,
        baseline,
        homepage,
        showcases,
        name,
        nsfw,
        style,
        trigger,
        type,
        version
      } = models[model]

      if (type === 'ckpt') {
        modelDetails[name] = {
          description,
          baseline,
          homepage,
          showcases,
          name,
          nsfw,
          style,
          trigger,
          type,
          version
        }
      }

      availableModelsMap[name] = new StableDiffusionModel({ name, count: 0 })
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch model details. API offline?`)
  } finally {
    setModelDetails(modelDetails)

    return availableModelsMap
  }
}

export default fetchModelDetails
