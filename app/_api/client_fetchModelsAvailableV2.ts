import { basePath } from 'BASE_PATH'
import { setAvailableModels } from 'app/_store/modelStore'
import { clientHeader } from 'app/_utils/appUtils'

// Cache and timestamp initialization
let modelsCache: any
let lastFetchTime = 0

export const client_fetchModelsAvailableV2 = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && modelsCache) {
    return modelsCache // Return the cached data
  }

  try {
    const res = await fetch(`${basePath}/api/models/available`, {
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
      lastFetchTime = currentTime
      setAvailableModels(models)
      modelsCache = models

      return models
    } else if (modelsCache) {
      return modelsCache
    } else {
      throw new Error('Error: Unable to parse model details.')
    }
  } catch (err) {
    console.log(`Error: Unable to fetch available models from AI Horde`)
    console.log(err)
    return modelsCache || []
  }
}
