import { IAvailableModels, IModelsDetails } from 'types/artbot'
import StableDiffusionModel from '../models/StableDiffusionModel'
import { setModelDetails } from '../store/modelStore'
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
    isPending = false
    setModelDetails(modelDetails)

    return availableModelsMap
  }
}

export default fetchModelDetails
