import type { NextApiRequest, NextApiResponse } from 'next'
import { AvailableModel } from '../../store/modelStore'
import serverFetchWithTimeout from '../../utils/serverFetchWithTimeout'

// Start with initial cache of popular models on initial boot:
const initModels = [
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'stable_diffusion_2.0',
    count: 9
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'stable_diffusion',
    count: 10
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'Yiffy',
    count: 6
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'Anything Diffusion',
    count: 8
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'Zeipher Female Model',
    count: 7
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'Mega Merge Diffusion',
    count: 8
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'Zack3D',
    count: 6
  },
  {
    performance: 0,
    queued: 0,
    eta: 0,
    name: 'waifu_diffusion',
    count: 5
  }
]

type Data = {
  success: boolean
  models?: any
}

interface IModelCache {
  models: Array<AvailableModel>
}

const cache: IModelCache = {
  models: [...initModels]
}

const fetchData = async () => {
  try {
    const resp = await serverFetchWithTimeout(
      `https://stablehorde.net/api/v2/status/models`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()
    cache.models = [...data]
  } catch (err) {
    // eh, it's okay if nothing happens.
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
    models: [...cache.models]
  })
}
