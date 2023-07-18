/**
 * hordeInfo.ts
 *
 * (This module should only ever be called / run on server)
 *
 * Used for fetching and caching performance data on ArtBot server. The idea is to help
 * mitigate calls to AI Horde API from clients, and also cache data in instances
 * where AI Horde API might be slow to respond or is down.
 */

import { clientHeader } from 'utils/appUtils'

let perf = {}

export const fetchHordePerformance = async () => {
  const __DEV__ = process.env.NODE_ENV !== 'production'

  try {
    const res = await fetch('https://aihorde.net/api/v2/status/performance', {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': __DEV__
          ? `ArtBot_DEV_Build:v.1:(discord)rockbandit#4910`
          : clientHeader()
      }
    })
    const data = await res.json()

    // Temporary hack to get around an issue where the Stable Horde backend alternates
    // between real request count and this weird / stale "43" queued_requests response.
    // TODO: Remove when backend is fixed.
    if (data?.queued_requests === 43) {
      return
    }

    perf = Object.assign({}, data)
  } catch (err) {
    // Silently fail
  }
}

export const getHordePerformanceCache = () => {
  return perf
}

export const initHordePerfMonitor = () => {
  fetchHordePerformance()
  setInterval(() => {
    fetchHordePerformance()
  }, 15000)
}
