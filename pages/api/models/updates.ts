import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchModelChanges } from 'app/_server-api/modelUpdates'

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
    const changes = fetchModelChanges()
    const timestamp = Date.now()

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
