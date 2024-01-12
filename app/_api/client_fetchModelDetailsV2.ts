import { basePath } from 'BASE_PATH'
import { IModelsDetails } from '_types/artbot'
import { setModelDetails } from 'app/_store/modelStore'
import { clientHeader } from 'app/_utils/appUtils'

// Cache and timestamp initialization
let modelsCache: any
let lastFetchTime = 0

export const client_fetchModelDetailsV2 = async () => {
  let modelDetails: IModelsDetails = {}
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && modelsCache) {
    return modelsCache // Return the cached data
  }

  try {
    const res = await fetch(`${basePath}/api/models/details`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'GET'
    })

    const data = await res.json()
    const { success, models } = data

    if (success) {
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
      }

      // availableModelsMap[name] = new StableDiffusionModel({ name, count: 0 })
      lastFetchTime = currentTime
      setModelDetails(modelDetails)
      modelsCache = { ...modelDetails }

      return modelDetails
    } else if (modelsCache) {
      return modelsCache
    } else {
      throw new Error('Error: Unable to parse model details.')
    }
  } catch (err) {
    console.log(`Error: Unable to fetch available models from AI Horde`)
    console.log(err)
    return modelsCache || {}
  }
}
