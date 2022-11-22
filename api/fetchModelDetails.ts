import { IModelsDetails, setModelDetails } from '../store/modelStore'
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
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch model details. API offline?`)
  } finally {
    isPending = false
    setModelDetails(modelDetails)
  }
}

export default fetchModelDetails
