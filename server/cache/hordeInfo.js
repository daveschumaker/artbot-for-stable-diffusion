const fetch = require('node-fetch')

let perf = {}

const fetchHordePerformance = async () => {
  try {
    const res = await fetch('https://stablehorde.net/api/v2/status/performance')
    const data = await res.json()
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
