const fetch = require('node-fetch')

let clusterSettings = {}

const getClusterSettings = () => {
  return {
    ...clusterSettings
  }
}

const fetchClusterSettings = async () => {
  if (!process.env.CLUSTER_SETTINGS_SERVICE) {
    return
  }

  try {
    const resp = await fetch(`${process.env.CLUSTER_SETTINGS_SERVICE}`, {
      method: 'GET'
    })
    const data = await resp.json()

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      clusterSettings = { ...data }
    }
  } catch (err) {
    // If cluster settings are offline, do nothing, as we don't want to overwrite existing data.
  }
}

const initServerStatusFetch = async () => {
  try {
    fetchClusterSettings()

    setInterval(() => {
      fetchClusterSettings()
    }, 10000)
  } catch (err) {}
}

module.exports = {
  getClusterSettings,
  initServerStatusFetch
}
