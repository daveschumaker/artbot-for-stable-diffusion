import 'dotenv/config'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  build?: string
}

const statusApi = process.env.STATUS_API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const data = {
    ...req.body,
    useragent: req.headers['user-agent']
  }

  if (statusApi) {
    fetch(`${statusApi}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'error',
        service: 'ArtBot_v1',
        payload: data
      })
    }).catch(() => {
      // Ignore any errors
    })
  }

  res.send({
    success: true
  })
}
