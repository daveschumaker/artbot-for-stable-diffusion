import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  build?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  if (process.env.TELEMETRY_API) {
    try {
      await fetch(process.env.TELEMETRY_API, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      // eh, it's okay if nothing happens.
    }
  }

  res.send({
    success: true
  })
}
