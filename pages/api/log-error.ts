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

  const data = {
    ...req.body,
    useragent: req.headers['user-agent']
  }

  try {
    await fetch(`http://localhost:4001/api/v1/artbot/error`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    // eh, it's okay if nothing happens.
  }

  res.send({
    success: true
  })
}
