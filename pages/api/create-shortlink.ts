import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  shortlink?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  try {
    const resp = await fetch(
      `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/create`,
      {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = (await resp.json()) || {}
    const { shortlink } = data

    if (shortlink) {
      return res.send({
        success: true,
        shortlink
      })
    } else {
      res.send({
        success: false
      })
    }
  } catch (err) {
    console.log(`Error: Unable to create shortlink.`)
    console.log(err)
    res.send({
      success: false
    })
  }
}
