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
  let clusterSettings

  try {
    const resp = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/status/cluster-settings`,
      {
        method: 'GET'
      }
    )

    const data = await resp.json()

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      clusterSettings = { ...data }
    }
  } catch (err) {
    // If an error occurs, do nothing, as we don't want to overwrite existing settings.
  }

  res.send({
    success: true,
    build,
    clusterSettings
  })
}
