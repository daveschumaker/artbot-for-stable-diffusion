import { IModelsDetails, setModelDetails } from '../store/modelStore'

let isPending = false
const fetchModelDetails = async () => {
  if (isPending) {
    return
  }

  if (document.visibilityState !== 'visible') {
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
          name,
          nsfw,
          style,
          trigger,
          type,
          version
        }
      }
    }
  } finally {
    isPending = false
    setModelDetails(modelDetails)
  }
}

export default fetchModelDetails
