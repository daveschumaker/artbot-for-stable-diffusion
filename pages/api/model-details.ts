import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  models?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const resp = await fetch(
      `https://raw.githubusercontent.com/Sygil-Dev/nataili-model-reference/main/db.json`,
      {
        method: 'GET'
      }
    )
    const data = await resp.json()

    return res.send({
      success: true,
      models: data
    })
  } catch (err) {
    // eh, it's okay if nothing happens.
  }

  return res.send({
    success: false
  })
}
