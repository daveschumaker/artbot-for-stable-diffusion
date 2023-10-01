import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  build?: string
  clusterSettings?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  const { offset = 0 } = req.query

  const resp = await fetch(
    `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/images/public/list/${offset}`,
    {
      method: 'GET',
      next: { revalidate: 60 }
    }
  )

  const data = (await resp.json()) || []
  res.send(data)
}
