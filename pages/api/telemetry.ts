import { updateImageCount } from 'app/_server-api/counters'
import type { NextApiRequest, NextApiResponse } from 'next'

// A separate service on the same server stores feedback form messages.
const FEEDBACK_SERVICE = 'http://localhost:4001/api/v1/artbot/feedback'

type Data = {
  status: string
  build?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ status: 'not ok' })
  }

  const data = { ...req.body }
  data.useragent = req.headers['user-agent']

  if (data.event === 'FEEDBACK_FORM') {
    // The form tells the user whether their message was sent, so a failure
    // here has to reach it.
    try {
      const feedback = await fetch(FEEDBACK_SERVICE, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!feedback.ok) {
        return res.status(502).json({ status: 'not ok' })
      }

      return res.send({
        status: 'ok'
      })
    } catch (err) {
      return res.status(502).json({ status: 'not ok' })
    }
  }

  if (data.event === 'IMAGE_RECEIVED_FROM_API') {
    try {
      updateImageCount()
      return res.send({
        status: 'ok'
      })
    } catch (err) {
      // eh, it's okay if nothing happens.
      return res.send({
        status: 'ok'
      })
    }
  }

  // This should be last
  if (process.env.TELEMETRY_API) {
    try {
      await fetch(process.env.TELEMETRY_API, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return res.send({
        status: 'ok'
      })
    } catch (err) {
      // eh, it's okay if nothing happens.
      return res.send({
        status: 'ok'
      })
    }
  }

  // If we get here for some strange reason.
  return res.send({
    status: 'ok'
  })
}
