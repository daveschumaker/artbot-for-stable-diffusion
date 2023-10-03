import type { NextApiRequest, NextApiResponse } from 'next'
import { readServerSettingsFile } from 'app/_server-api/adminTools'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  let serverSettings = (await readServerSettingsFile()) || {}

  res.send({
    success: true,
    serverSettings
  })
}
