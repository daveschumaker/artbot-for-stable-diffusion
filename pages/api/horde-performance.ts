import {
  getHordePerformanceCache,
  initHordePerfMonitor
} from 'app/_server-api/hordeInfo'
import type { NextApiRequest, NextApiResponse } from 'next'

initHordePerfMonitor()

type Data = {
  success: boolean
  perfStats?: object
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const perfStats = getHordePerformanceCache()

    return res.send({
      success: true,
      perfStats
    })
  } catch (err) {
    return res.send({
      success: true,
      perfStats: {}
    })
  }
}
