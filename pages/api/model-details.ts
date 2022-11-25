import type { NextApiRequest, NextApiResponse } from 'next'
import serverFetchWithTimeout from '../../utils/serverFetchWithTimeout'
import modelDetailsJson from '../../store/model-details.json'

type Data = {
  success: boolean
  models?: any
}

const cache = {
  models: { ...modelDetailsJson }
}

const fetchData = async () => {
  try {
    const resp = await serverFetchWithTimeout(
      `https://raw.githubusercontent.com/Sygil-Dev/nataili-model-reference/main/db.json`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()
    cache.models = { ...data }
  } catch (err) {
    // Don't worry if nothing happens...
  }
}

// Kick off periodic fetch
setInterval(async () => {
  await fetchData()
}, 60000)

// Kick off initial data fetch on server mount
fetchData()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  return res.send({
    success: true,
    models: { ...cache.models }
  })
}
