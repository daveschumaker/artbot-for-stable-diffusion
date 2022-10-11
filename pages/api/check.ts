import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  status?: string
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

    if (resp.status === 404) {
      console.log(
        `${new Date().toLocaleString()}: Error: No pending job found for jobId: ${id}.`
      )
      return res.send({
        success: false,
        status: 'NOT_FOUND'
      })
    }

    const data = await resp.json()
    const { message = '' } = data

    if (message.indexOf('not found') >= 0) {
      console.log(
        `${new Date().toLocaleString()}: Error: No pending job found for jobId: ${id}.`
      )
      return res.send({
        success: false,
        status: 'NOT_FOUND'
      })
    }

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
