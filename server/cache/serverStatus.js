require('dotenv').config()
const fetch = require('node-fetch')
const fs = require('fs')

const LocalStorage = require('node-localstorage').LocalStorage
const __DEV__ = process.env.NODE_ENV !== 'production'

let dataPath = ''

if (process.env.DEV_SERVER_MSG && process.env.PROD_SERVER_MSG) {
  dataPath = __DEV__
    ? process.env.DEV_SERVER_MSG
    : process.env.PROD_SERVER_MSG
}

if (typeof dataPath === 'undefined' || !dataPath || !fs.existsSync(dataPath)) {
  dataPath = './ArtBot_ServerMessage'
}

const localStorage = new LocalStorage(dataPath, 10485760)

const storageActions = {
  load() {
    try {
      const data = localStorage.getItem('update') || ''
      const serverMessage = JSON.parse(data) || {}

      if (serverMessage.timestamp) {
        serverMessage.fetchedTimestamp = Date.now()
        serverMessage.timeDiffSec = Math.floor((serverMessage.fetchedTimestamp - serverMessage.timestamp) / 1000)
      }
      return serverMessage
    } catch (err) {
      return {}
    }
  },
  set(obj = {}) {
    try {
      obj.timestamp = Date.now()
      localStorage.setItem('update', JSON.stringify(obj))
      return
    } catch (err) {
      return
    }
  }
}

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
  } catch (err) { }
}

module.exports = {
  getClusterSettings,
  initServerStatusFetch,
  getServerMessage: storageActions.load,
  setServerMessage: storageActions.set,
}
