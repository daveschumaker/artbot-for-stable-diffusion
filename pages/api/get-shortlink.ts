import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  imageParams?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  const { shortlink } = req.query

  try {
    const resp = await fetch(
      `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/load/${shortlink}`,
      {
        method: 'GET'
      }
    )

    const data = (await resp.json()) || {}
    const { data: shortlinkData } = data

    return res.send({
      success: true,
      imageParams: shortlinkData
    })
  } catch (err) {
    res.send({
      success: false
    })
  }
}
