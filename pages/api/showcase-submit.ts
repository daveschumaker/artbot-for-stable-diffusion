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
    text: `New showcase candidate requested:\nhttps://tinybots.net/artbot?i=${req.body.shortlink}`,
    html: `
    New showcase candidate requested:<br/>https://tinybots.net/artbot?i=${req.body.shortlink}<br/><br/>
    <img src="https://s3.amazonaws.com/tinybots.artbot/artbot/images/${req.body.shortlink}.webp" style="width:100px;">
    `
  })

  res.send({
    success: true
  })
}
