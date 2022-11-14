interface Model {
  description: string
  nsfw: boolean
  style: string
  trigger?: string
  type: string
}

interface ModelsCache {
  [key: string]: Model
}

export const modelsCache: ModelsCache = {}

export const modelDetails = (name: string) => {
  return modelsCache[name]
}

let lastFetchTime = 0

export const models = async () => {
  if (document.visibilityState === 'visible') {
    return
  }

  const timestamp = Date.now() / 1000

  // Periodically fetch models from API every 15 minutes
  if (timestamp - lastFetchTime < 60 * 15) {
    return
  } else {
    lastFetchTime = Date.now()
  }

  try {
    const res = await fetch(`/artbot/api/model-details`)
    const { models } = await res.json()

    for (const model in models) {
      const { description, name, nsfw, style, trigger, type } = models[model]

      if (type === 'ckpt') {
        modelsCache[name] = {
          description,
          nsfw,
          style,
          trigger,
          type
        }
      }
    }

    return modelsCache
  } catch (err) {
    return {}
    // Ah well.
  }
}
