let workerDetailsCache = []

const fetchWorkerDetails = async () => {
  try {
    const resp = await fetch(`https://aihorde.net/api/v2/workers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': `ArtBot:v.1:(discord)rockbandit#4910`
      }
    })

    const data = (await resp.json()) || []

    if (Array.isArray(data) && data.length > 0) {
      workerDetailsCache = [].concat(data)
    }
  } catch (err) {
    // If an error occurs, we don't want to overwrite any existing data.
  }
}

const initWorkerDetailsFetch = () => {
  fetchWorkerDetails()
  setInterval(() => {
    fetchWorkerDetails()
  }, 60000)
}

const getWorkerDetails = () => {
  return workerDetailsCache
}

module.exports = {
  initWorkerDetailsFetch,
  fetchWorkerDetails,
  getWorkerDetails
}
