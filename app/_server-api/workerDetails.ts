/**
 * worderDetails.ts
 *
 * (This module should only ever be called / run on server)
 *
 * Used for fetching and caching worker data on ArtBot server. The idea is to help
 * mitigate calls to AI Horde API from clients, and also cache data in instances
 * where AI Horde API might be slow to respond or is down.
 */

import { clientHeader } from 'app/_utils/appUtils'

let workerDetailsCache: any[] = []

export const fetchWorkerDetails = async () => {
  const __DEV__ = process.env.NODE_ENV !== 'production'

  try {
    const resp = await fetch(`https://aihorde.net/api/v2/workers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': __DEV__
          ? `ArtBot_DEV_Build:v.1:(discord)rockbandit#4910`
          : clientHeader()
      }
    })

    const data = (await resp.json()) || []

    if (Array.isArray(data) && data.length > 0) {
      workerDetailsCache = [...data]
    }
  } catch (err) {
    // Silently fail
  }
}

export const initWorkerDetailsFetch = async () => {
  await fetchWorkerDetails()
  setInterval(async () => {
    await fetchWorkerDetails()
  }, 30000)
}

export const getWorkerDetails = () => {
  return workerDetailsCache
}
