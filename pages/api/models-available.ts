import {
  getAvailableModels,
  initModelAvailabilityFetch
} from 'app/_api/modelsAvailable'
import type { NextApiRequest, NextApiResponse } from 'next'

initModelAvailabilityFetch()

type Data = {
  success: boolean
  models?: any
  timestamp?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const { timestamp, models } = getAvailableModels()

    return res.send({
      success: true,
      models: models,
      timestamp
    })
  } catch (err) {
    return res.send({
      success: true,
      models: []
    })
  }
}
