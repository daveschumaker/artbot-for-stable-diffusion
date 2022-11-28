const fetch = require('node-fetch')

const cache = {
  availableFetchTimestamp: 0,
  detailsFetchTimestamp: 0,
  models: [],
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
    const resp = await fetch(`https://stablehorde.net/api/v2/status/models`, {
      method: 'GET'
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
    const resp = await fetch(
      `https://raw.githubusercontent.com/Sygil-Dev/nataili-model-reference/main/db.json`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      cache.details = { ...data }
      cache.detailsFetchTimestamp = Date.now()
    }
  } catch (err) {}
}

const initModelDataFetch = async () => {
  try {
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
