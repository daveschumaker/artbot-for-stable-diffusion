const fetch = require('node-fetch')

const cache = {
  message: ''
}

const getServerMessage = () => {
  return {
    message: cache.message
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
  getServerMessage,
  initServerStatusFetch
}
