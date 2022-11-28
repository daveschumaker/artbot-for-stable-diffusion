import type { NextApiRequest, NextApiResponse } from 'next'
import serverFetchWithTimeout from '../../utils/serverFetchWithTimeout'

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
    const resp = await serverFetchWithTimeout(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/available`,
      {
        method: 'GET'
      }
    )

    const data = (await resp.json()) || {}
    const { models = [], timestamp } = data
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
