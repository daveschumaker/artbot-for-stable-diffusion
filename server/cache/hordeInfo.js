const fetch = require('node-fetch')

let perf = {}

const fetchHordePerformance = async () => {
  try {
    const res = await fetch('https://stablehorde.net/api/v2/status/performance')
    const data = await res.json()

    // Temporary hack to get around an issue where the Stable Horde backend alternates
    // between real request count and this weird / stale "43" queued_requests response.
    // TODO: Remove when backend is fixed.
    if (data?.queued_requests === 43) {
      return
    }

    perf = Object.assign({}, data)
  } catch (err) {}
}

const getHordePerformanceCache = () => {
  return perf
}

const initHordePerfMonitor = () => {
  fetchHordePerformance()
  setInterval(() => {
    fetchHordePerformance()
  }, 15000)
}

module.exports = {
  getHordePerformanceCache,
  fetchHordePerformance,
  initHordePerfMonitor
}
