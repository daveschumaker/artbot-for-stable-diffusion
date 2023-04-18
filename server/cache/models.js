const fetch = require('node-fetch')

// Temporarily import a static version of available models
// in order to get page up and running while API loads.
const availableModels = require('./availableModels.json')
const { modelDiff, loadInitChanges } = require('./modelUpdates')

const cache = {
  availableFetchTimestamp: 0,
  detailsFetchTimestamp: 0,
  models: [...availableModels],
  details: {}
}

const getAvailableModels = () => {
  return {
    timestamp: cache.availableFetchTimestamp,
    models: cache.models
  }
}

const getModelDetails = () => {
  return {
    timestamp: cache.detailsFetchTimestamp,
    models: cache.details
  }
}

const fetchAvailableModels = async () => {
  try {
    const resp = await fetch(`https://aihorde.net/api/v2/status/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': `ArtBot:v.1:(discord)rockbandit#4910`
      }
    })
    const data = await resp.json()

    if (Array.isArray(data) && data.length > 0) {
      cache.models = [...data]
      cache.availableFetchTimestamp = Date.now()
    }
  } catch (err) {}
}

const fetchModelDetails = async () => {
  try {
    let modelDetails = {}

    const resp = await fetch(
      `https://raw.githubusercontent.com/db0/AI-Horde-image-model-reference/main/stable_diffusion.json`,
      {
        method: 'GET'
      }
    )

    const data = (await resp.json()) || {}

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      for (const model in data) {
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
        } = data[model]

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

      delete modelDetails.LDSR
      delete modelDetails['stable_diffusion_1.4']
      modelDiff(modelDetails)

      cache.details = { ...modelDetails }
      cache.detailsFetchTimestamp = Date.now()
    }
  } catch (err) {}
}

const initModelDataFetch = async () => {
  try {
    loadInitChanges()
    fetchAvailableModels()
    fetchModelDetails()

    setInterval(() => {
      fetchAvailableModels()
      fetchModelDetails()
    }, 60000)
  } catch (err) {}
}

module.exports = {
  getAvailableModels,
  getModelDetails,
  initModelDataFetch
}
