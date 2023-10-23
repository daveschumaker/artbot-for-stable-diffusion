/**
 * modelsAvailable.ts
 *
 * (This module should only ever be called / run on server)
 *
 * Used for fetching and caching model availability data on ArtBot server. The idea is to help
 * mitigate calls to AI Horde API from clients, and also cache data in instances
 * where AI Horde API might be slow to respond or is down.
 */

import fetch from 'node-fetch'
import { clientHeader } from 'app/_utils/appUtils'

// Temporarily import a static version of available models
// in order to get page up and running while API loads.
import availableModels from '../_store/availableModels.json'
import { modelDiff, loadInitChanges } from './modelUpdates'
import { ModelDetails } from '_types/horde'

let SHOW_DEBUG_LOGS = false
// Prevent me from accidentally deploying debug logs to production
if (process.env.NODE_ENV === 'production') {
  SHOW_DEBUG_LOGS = false
}

const cache = {
  availableFetchTimestamp: 0,
  detailsFetchTimestamp: 0,
  models: [...availableModels],
  details: {}
}

let pendingModelsRequest = false
const fetchAvailableModels = async () => {
  const __DEV__ = process.env.NODE_ENV !== 'production'

  if (pendingModelsRequest) return
  pendingModelsRequest = true

  if (SHOW_DEBUG_LOGS) {
    console.log(`\n${new Date().toLocaleTimeString()}`)
    console.log(`Fetching available models from aihorde.net`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
    console.log(`\n${new Date().toString()}`)
    console.log('Error: fetchAvailableModels - request timed out.')
  }, 5000)

  try {
    const resp = await fetch(`https://aihorde.net/api/v2/status/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': __DEV__
          ? `ArtBot_DEV_Build:v.1:(discord)rockbandit#4910`
          : clientHeader()
      },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (resp.status === 522) {
      console.log(`Error: fetchAvailableModels - connection timed out.`)
      return false
    }

    const data = await resp.json()

    if (Array.isArray(data) && data.length > 1) {
      if (SHOW_DEBUG_LOGS) {
        console.log(
          `Valid data. Updating available models cache. Size:`,
          data.length,
          `\n`
        )
      }

      cache.models = [...data]
      cache.availableFetchTimestamp = Date.now()
      return true
    }
  } catch (err) {
    console.error(err)
    return false
  } finally {
    pendingModelsRequest = false
  }
}

const fetchModelDetails = async () => {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
    console.log(`\n${new Date().toString()}`)
    console.log('Error: fetchModelDetails - request timed out.')
  }, 5000)

  try {
    let modelDetails: any = {}

    if (SHOW_DEBUG_LOGS) {
      console.log(`\n${new Date().toLocaleTimeString()}`)
      console.log(`Fetching model details from github`)
    }

    const resp = await fetch(
      `https://raw.githubusercontent.com/db0/AI-Horde-image-model-reference/main/stable_diffusion.json`,
      {
        method: 'GET',
        signal: controller.signal
      }
    )

    clearTimeout(timeout)

    const data: { [key: string]: ModelDetails } = (await resp.json()) as {
      [key: string]: ModelDetails
    }

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      if (SHOW_DEBUG_LOGS) {
        console.log(
          `Valid data. Updating model details cache. Size:`,
          Object.keys(data).length,
          `\n`
        )
      }

      if (Object.keys(data).length <= 1) {
        console.log(`\n${new Date().toString()}`)
        console.log(`Potentially invalid model data detected?`)
        console.log(data)
        return false
      }

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

      return true
    }
  } catch (err) {
    console.error(err)
    return false
  }
}

// Interval is every 30 seconds, so in theory, that should handle any updates.
// If we noticed that the cache hasn't been updated, then sometime must have happened,
// so we try to force an update after a certain amount of time has passed.
const CACHE_TIMEOUT = 60000

export const getAvailableModels = async () => {
  const currentTime = Date.now()

  if (SHOW_DEBUG_LOGS) {
    console.log(
      `\ngetAvailable models, time since last fetch`,
      currentTime - cache.availableFetchTimestamp
    )
  }

  if (currentTime - cache.availableFetchTimestamp >= CACHE_TIMEOUT) {
    // No await here, since we want to immediately return data to user without waiting
    // for API call to finish. This means data may be, at most (in optimal scenarios),
    // only 1 minute out of date.
    fetchAvailableModels()

    if (SHOW_DEBUG_LOGS) {
      console.log(`Refreshing availableModels`)
    }
    return {
      timestamp: cache.availableFetchTimestamp,
      models: cache.models
    }
  }

  if (SHOW_DEBUG_LOGS) {
    console.log(
      `Pulling availableModels from cache. Size:`,
      cache.models.length
    )
  }
  return {
    timestamp: cache.availableFetchTimestamp,
    models: cache.models
  }
}

export const getModelDetails = async () => {
  const currentTime = Date.now()

  if (SHOW_DEBUG_LOGS) {
    console.log(
      `getModelDetails models, time since last fetch`,
      currentTime - cache.availableFetchTimestamp
    )
  }

  if (currentTime - cache.detailsFetchTimestamp >= CACHE_TIMEOUT) {
    // No await here, since we want to immediately return data to user without waiting
    // for API call to finish. This means data may be, at most (in optimal scenarios),
    // only 1 minute out of date.
    fetchModelDetails()

    if (SHOW_DEBUG_LOGS) {
      console.log(`Refreshing modelDetails`)
    }

    return {
      timestamp: cache.detailsFetchTimestamp,
      models: cache.details
    }
  }

  if (SHOW_DEBUG_LOGS) {
    console.log(
      `Pulling modelDetails from cache. Size:`,
      Object.keys(cache.details).length
    )
  }

  return {
    timestamp: cache.detailsFetchTimestamp,
    models: cache.details
  }
}

let modelFetchActive = false
export const initModelAvailabilityFetch = async () => {
  try {
    if (modelFetchActive) return

    if (SHOW_DEBUG_LOGS) {
      console.log(`Calling initModelAvailabilityFetch`)
    }

    loadInitChanges()
    await fetchAvailableModels()
    await fetchModelDetails()
    modelFetchActive = true

    setInterval(async () => {
      if (SHOW_DEBUG_LOGS) {
        console.log(`\n${new Date().toLocaleTimeString()}`)
        console.log(
          `30s interval refreshing available models and model details`
        )
      }

      await fetchAvailableModels()
      await fetchModelDetails()
    }, 30000)
  } catch (err) {
    console.error(
      'Error initializing model data fetch. Will try again in 60 seconds:'
    )
    console.log(err)

    // Encountered a random issue where there was an error fetching model availability on initial boot.
    // If this happens, wait a bit of time and try again.
    if (!modelFetchActive) {
      setTimeout(() => {
        initModelAvailabilityFetch()
      }, 60000)
    }
  }
}
