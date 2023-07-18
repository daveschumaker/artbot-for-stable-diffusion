/**
 * modelsAvailable.ts
 *
 * (This module should only ever be called / run on server)
 *
 * Used for fetching and caching model availability data on ArtBot server. The idea is to help
 * mitigate calls to AI Horde API from clients, and also cache data in instances
 * where AI Horde API might be slow to respond or is down.
 */

import { clientHeader } from 'utils/appUtils'

// Temporarily import a static version of available models
// in order to get page up and running while API loads.
import availableModels from './availableModels.json'
import { modelDiff, loadInitChanges } from './modelUpdates'

const cache = {
  availableFetchTimestamp: 0,
  detailsFetchTimestamp: 0,
  models: [...availableModels],
  details: {}
}

export const getAvailableModels = () => ({
  timestamp: cache.availableFetchTimestamp,
  models: cache.models
})

export const getModelDetails = () => ({
  timestamp: cache.detailsFetchTimestamp,
  models: cache.details
})

const fetchAvailableModels = async () => {
  const __DEV__ = process.env.NODE_ENV !== 'production'

  try {
    const resp = await fetch(`https://aihorde.net/api/v2/status/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': __DEV__
          ? `ArtBot_DEV_Build:v.1:(discord)rockbandit#4910`
          : clientHeader()
      }
    })
    const data = await resp.json()

    if (Array.isArray(data) && data.length > 0) {
      cache.models = [...data]
      cache.availableFetchTimestamp = Date.now()
    }
  } catch (err) {
    console.error(err)
  }
}

export const fetchModelDetails = async () => {
  try {
    let modelDetails: any = {}

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
  } catch (err) {
    console.error(err)
  }
}

export const initModelAvailabilityFetch = async () => {
  try {
    loadInitChanges()
    await fetchAvailableModels()
    await fetchModelDetails()

    setInterval(async () => {
      await fetchAvailableModels()
      await fetchModelDetails()
    }, 60000)
  } catch (err) {
    console.error('Error initializing model data fetch:', err)
  }
}
