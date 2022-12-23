import StableDiffusionModel from '../models/StableDiffusionModel'
import {
  IAvailableModels,
  IModelsDetails,
  setModelDetails
} from '../store/modelStore'
import { isAppActive } from '../utils/appUtils'

let isPending = false
const fetchModelDetails = async () => {
  if (isPending) {
    return
  }

  if (!isAppActive()) {
    return
  }

  isPending = true
  let modelDetails: IModelsDetails = {}
  let availableModelsMap: IAvailableModels = {}

  try {
    const res = await fetch(`/artbot/api/model-details`)
    const { models }: { models: IModelsDetails } = await res.json()

    for (const model in models) {
      const {
        description,
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
    isPending = false
    setModelDetails(modelDetails)

    return availableModelsMap
  }
}

export default fetchModelDetails
