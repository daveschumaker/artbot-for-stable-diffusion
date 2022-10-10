// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  jobId?: string
  base64String?: string
  seed?: number
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
      `https://stablehorde.net/api/v2/generate/status/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await resp.json()
    const { generations } = data

    console.log(`Image status:`, data)

    if (Array.isArray(generations)) {
      const [image] = generations
      const { img: base64String, seed } = image

      return res.send({
        success: true,
        jobId: id,
        base64String,
        seed
      })
    }

    return res.send({
      success: false
    })
  } catch (err) {
    console.log(`Error: Unable to fetch image for job: ${id}.`)
    console.log(err)
    res.send({
      success: false
    })
  }
}
