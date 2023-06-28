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
    console.error(err)
  }
}

const initWorkerDetailsFetch = async () => {
  await fetchWorkerDetails()
  setInterval(async () => {
    await fetchWorkerDetails()
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
