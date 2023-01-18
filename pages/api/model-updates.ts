import type { NextApiRequest, NextApiResponse } from 'next'
import serverFetchWithTimeout from '../../utils/serverFetchWithTimeout'

type Data = {
  success: boolean
  changes?: any
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
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/updates`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()
    const { changes = [], timestamp } = data
    return res.send({
      success: true,
      changes,
      timestamp
    })
  } catch (err) {
    return res.send({
      success: true,
      changes: []
    })
  }
}
