import type { NextApiRequest, NextApiResponse } from 'next'
import buildInfo from '../../build_info.json'

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

  const { build } = buildInfo

  res.send({
    success: true,
    build
  })
}
