import type { NextApiRequest, NextApiResponse } from 'next'
import { AvailableModel } from '../../store/modelStore'

type Data = {
  success: boolean
  models?: any
}

interface IModelCache {
  fetchTimestamp: number
  models: Array<AvailableModel>
}

const cache: IModelCache = {
  fetchTimestamp: 0,
  models: []
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  const timeDiff = Date.now() - cache.fetchTimestamp
  if (timeDiff <= 60000) {
    return res.send({
      success: true,
      models: [...cache.models]
    })
  }

  try {
    const resp = await fetch(`https://stablehorde.net/api/v2/status/models`, {
      method: 'GET'
    })

    const data = await resp.json()

    cache.fetchTimestamp = Date.now()
    cache.models = [...data]

    return res.send({
      success: true,
      models: data
    })
  } catch (err) {
    // eh, it's okay if nothing happens.
  }

  // Optimistically send model availability if we already have the information.
  if (cache.fetchTimestamp > 0) {
    return res.send({
      success: true,
      models: [...cache.models]
    })
  } else {
    return res.send({
      success: false
    })
  }
}
