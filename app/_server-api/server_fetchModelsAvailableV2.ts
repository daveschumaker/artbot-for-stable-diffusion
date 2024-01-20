import { clientHeader } from 'app/_utils/appUtils'

// Cache and timestamp initialization
let modelAvailabilityCache: any
let lastFetchTime = 0
let intervalSet = false
const __DEV__ = process.env.NODE_ENV !== 'production'

export const server_fetchModelsAvailableV2 = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && modelAvailabilityCache) {
    return modelAvailabilityCache // Return the cached data
  }

  try {
    const res = await fetch(`https://aihorde.net/api/v2/status/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': __DEV__
          ? `ArtBot_DEV_Build:v.1:(discord)rockbandit#4910`
          : clientHeader()
      }
    })

    const data = await res.json()

    // Assumes we always have at least 5 models on the Horde
    if (Array.isArray(data) && data.length > 1) {
      modelAvailabilityCache = [...data]
      lastFetchTime = currentTime
      return modelAvailabilityCache
    } else if (modelAvailabilityCache) {
      return modelAvailabilityCache
    } else {
      if ('message' in data) {
        if (data.message === '90 per 1 minute') {
          return modelAvailabilityCache || []
        }
      }

      console.log(`server_fetchModelsAvailableV2 Error:`)
      console.log(data)
      throw new Error(
        'server_fetchModelsAvailableV2: JSON does not match expected minimum number of keys (5).'
      )
    }
  } catch (err) {
    console.log(`Error: Unable to fetch models details from AI Horde github`)
    console.log(err)
  } finally {
    if (!intervalSet) {
      setInterval(server_fetchModelsAvailableV2, 60000)
      intervalSet = true
    }

    return modelAvailabilityCache || []
  }
}
