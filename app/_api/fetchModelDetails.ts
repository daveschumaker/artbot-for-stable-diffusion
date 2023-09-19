import { IAvailableModels, IModelsDetails } from '_types/artbot'
import StableDiffusionModel from 'app/_data-models/StableDiffusionModel'
import { setModelDetails } from 'app/_store/modelStore'
import { isAppActive } from 'app/_utils/appUtils'
import { basePath } from 'BASE_PATH'

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
    const res = await fetch(`${basePath}/api/model-details`)
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
