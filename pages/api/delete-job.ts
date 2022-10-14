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
      `https://stablehorde.net/api/v2/generate/status/${id}`,
      {
        method: 'DELETE'
      }
    )

    const data = await resp.json()

    console.log(`Deleting jobId: ${id}`)

    return res.send({
      success: true
    })
  } catch (err) {
    console.log(`Error: Unable to delete job.`)
    console.log(err)

    return res.send({
      success: true
    })
  }
}
