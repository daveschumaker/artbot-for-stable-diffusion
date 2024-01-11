// Cache and timestamp initialization
let modelDetailsCache: any
let lastFetchTime = 0
let intervalSet = false

export const server_fetchModelDetails = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && modelDetailsCache) {
    return modelDetailsCache // Return the cached data
  }

  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/Haidra-Org/AI-Horde-image-model-reference/main/stable_diffusion.json`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      }
    )

    const data = await res.json()

    // Parse json to ensure validity
    let jsonString = JSON.stringify(data)
    const json = JSON.parse(jsonString)

    // Optional: Additional checks to ensure the JSON structure is as expected
    if (!json || typeof json !== 'object' || Object.keys(json).length === 0) {
      throw new Error('JSON is empty or not an object')
    }

    // Assumes we always have at least 5 models on the Horde
    if (Object.keys(json).length > 5) {
      modelDetailsCache = json
      lastFetchTime = currentTime
      return modelDetailsCache
    } else if (modelDetailsCache) {
      return modelDetailsCache
    } else {
      throw new Error(
        'JSON does not match expected minimum number of keys (5).'
      )
    }
  } catch (err) {
    console.log(`Error: Unable to fetch models details from AI Horde github`)
    console.log(err)
  } finally {
    if (!intervalSet) {
      setInterval(server_fetchModelDetails, 120000)
      intervalSet = true
    }

    return modelDetailsCache || {}
  }
}
