import { sendEmail } from 'app/_server-api/emailer'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  if (!req.body && !req.body.shortlink) {
    return res.send({
      success: false
    })
  }

  sendEmail({
    subject: '🤖 ArtBot Showcase Request',
    text: `New showcase candidate requested:\nhttps://tinybots.net/artbot?i=${req.body.shortlink}`
  })

  res.send({
    success: true
  })
}
