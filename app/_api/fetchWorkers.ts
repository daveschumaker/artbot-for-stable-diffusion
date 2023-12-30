import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

// Cache and timestamp initialization
let workersCache: any[] = []
let lastFetchTime = 0

export const fetchWorkers = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && workersCache.length > 0) {
    return workersCache // Return the cached data
  }

  try {
    const res = await fetch(`${getApiHostServer()}/api/v2/workers`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'GET'
    })

    const data = await res.json()

    if (Array.isArray(data)) {
      // Filter for image workers only:
      const filtered = data.filter((worker) => worker.type === 'image')

      // Update the cache and timestamp
      workersCache = filtered
      lastFetchTime = currentTime
    } else {
      return []
    }
  } catch (err) {
    console.log(`Error: Unable to fetch worker details from AI Horde`)
    console.log(err)
    return []
  }

  return workersCache // Return the new data or the old cache if the fetch failed
}
