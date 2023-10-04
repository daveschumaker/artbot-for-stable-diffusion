import type { NextApiRequest, NextApiResponse } from 'next'

// @ts-ignore
import db from 'app/_utils/debug/db'

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '50mb' // Set desired value here
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This route is used for testing and should only work on local environments
  const isProd = process.env.NODE_ENV === 'production'
  if (req.method !== 'GET' || isProd) {
    return res.status(400).json({ success: false })
  }

  const { id = 0 } = req.query

  try {
    const result = db.get(Number(id))
    return res.send({ ...result })
  } catch (error) {
    console.error('Error fetching records:', error)
    res.send({
      success: false
    })
  }
}
