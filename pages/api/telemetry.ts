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

  const data = { ...req.body }
  let ip

  if (req.headers['x-forwarded-for']) {
    // @ts-ignore
    ip = req.headers['x-forwarded-for'].split(',')[0]
  } else if (req.headers['x-real-ip']) {
    ip = req?.connection?.remoteAddress
  } else {
    ip = req?.connection?.remoteAddress
  }

  if (ip) {
    data.ip = ip
  }

  data.useragent = req.headers['user-agent']

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

  if (data.event === 'IMAGE_RECEIVED_FROM_API') {
    try {
      await fetch(
        `http://localhost:${process.env.PORT}/artbot/api/v1/status/new-image`,
        {
          method: 'POST'
        }
      )
    } catch (err) {
      // eh, it's okay if nothing happens.
    }
  }

  res.send({
    success: true
  })
}
