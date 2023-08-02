import {
  getWorkerDetails,
  initWorkerDetailsFetch
} from 'app/_server-api/workerDetails'
import type { NextApiRequest, NextApiResponse } from 'next'

initWorkerDetailsFetch()

type Data = {
  success: boolean
  workers?: Array<any>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const workers = getWorkerDetails()

    return res.send({
      success: true,
      workers
    })
  } catch (err) {
    return res.send({
      success: true,
      workers: []
    })
  }
}
