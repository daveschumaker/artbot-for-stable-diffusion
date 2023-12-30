import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

// Cache and timestamp initialization
let modelsCache: any[] = []
let lastFetchTime = 0

export const fetchAvailableModelsV2 = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && modelsCache.length > 0) {
    return modelsCache // Return the cached data
  }

  try {
    const res = await fetch(`${getApiHostServer()}/api/v2/status/models`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'GET'
    })

    const data = await res.json()

    if (Array.isArray(data)) {
      // Update the cache and timestamp
      modelsCache = data
      lastFetchTime = currentTime
    } else {
      return []
    }
  } catch (err) {
    console.log(`Error: Unable to fetch available models from AI Horde`)
    console.log(err)
    return []
  }

  return modelsCache // Return the new data or the old cache if the fetch failed
}
