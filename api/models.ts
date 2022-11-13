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

let currentModelNames: Array<string> = [] // Used to pull random model name
export const modelsCache: ModelsCache = {}

export const getAllModelNames = () => {
  return currentModelNames
}

export const modelDetails = (name: string) => {
  return modelsCache[name]
}

let lastFetchTime = 0

export const models = async () => {
  if (!document.hasFocus()) {
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
    let modelNames = []

    for (const model in models) {
      const { description, name, nsfw, style, trigger, type } = models[model]

      if (type === 'ckpt') {
        modelNames.push(name)
        modelsCache[name] = {
          description,
          nsfw,
          style,
          trigger,
          type
        }
      }
    }

    currentModelNames = [...modelNames]
    return modelsCache
  } catch (err) {
    return {}
    // Ah well.
  }
}
