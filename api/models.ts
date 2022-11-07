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

export const models = async () => {
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

// Periodically fetch models from API every 15 minutes
setInterval(() => {
  models()
}, 60 * 1000 * 15)
