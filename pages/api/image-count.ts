import { getImageCount, initLoadImageCount } from 'app/_server-api/counters'
import type { NextApiRequest, NextApiResponse } from 'next'

initLoadImageCount()

type Data = {
  success: boolean
  totalImages?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const totalImages = getImageCount()

    return res.send({
      success: true,
      totalImages
    })
  } catch (err) {
    return res.send({
      success: true
    })
  }
}
