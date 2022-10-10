// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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

  const { id } = req.body

  if (!id) {
    return res.status(400).json({
      success: false
    })
  }

  try {
    const resp = await fetch(
      `https://stablehorde.net/api/v2/generate/check/${id}`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()

    res.send({
      success: true,
      ...data
    })
  } catch (err) {
    console.log(
      `${new Date().toLocaleString()}: Error: Unable to check image generation status for jobId: ${id}.`
    )
    res.send({
      success: false
    })
  }
}
