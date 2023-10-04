import type { NextApiRequest, NextApiResponse } from 'next'

// @ts-ignore
import db from 'app/_utils/debug/db'

type Data = {
  success: boolean
}

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
  res: NextApiResponse<Data>
) {
  // This route is used for testing and should only work on local environments
  const isProd = process.env.NODE_ENV === 'production'
  if (req.method !== 'POST' || isProd) {
    return res.status(400).json({ success: false })
  }

  if (!req.body) {
    return res.send({
      success: false
    })
  }

  try {
    const data = JSON.parse(req.body)
    db.insert(req.body)
    console.log(`Inserting id:`, data.id)
    return res.send({ success: true })
  } catch (err) {
    res.send({
      success: false
    })
  }
}
