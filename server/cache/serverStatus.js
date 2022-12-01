const fetch = require('node-fetch')

const cache = {
  message: '',
  enrollPct: 0,
  showBetaOption: false
}

const getServerSettings = () => {
  return {
    message: cache.message,
    enrollPct: cache.enrollPct,
    showBetaOption: cache.showBetaOption
  }
}

const fetchServerMessage = async () => {
  if (!process.env.MESSAGE_SERVICE) {
    return
  }

  try {
    const resp = await fetch(`${process.env.MESSAGE_SERVICE}`, {
      method: 'GET'
    })
    const data = (await resp.json()) || {}

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      cache.message = data.message
      cache.enrollPct = data.enrollPct || 0
      cache.showBetaOption = data.showBetaOption || false
    }
  } catch (err) {}
}

const initServerStatusFetch = async () => {
  try {
    fetchServerMessage()

    setInterval(() => {
      fetchServerMessage()
    }, 10000)
  } catch (err) {}
}

module.exports = {
  getServerSettings,
  initServerStatusFetch
}
