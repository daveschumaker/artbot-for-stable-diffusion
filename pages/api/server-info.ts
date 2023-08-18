import type { NextApiRequest, NextApiResponse } from 'next'
import buildInfo from '../../build_info.json'

type Data = {
  success: boolean
  build?: string
  clusterSettings?: string
  serverMessage?: any
}

let cachedStatus: any = null
let lastRefreshTime = 0

async function refreshStatus() {
  try {
    const status: any = await import('../../server-status.json')

    if (status.live === true) {
      cachedStatus = {
        title: status.title,
        content: status.content,
        live: status.live
      }

      if (!isNaN(status.timestamp) && status.timestamp > 0) {
        cachedStatus.timestamp = status.timestamp
      }

      lastRefreshTime = Date.now()
    } else {
      cachedStatus = null
    }
  } catch (err) {
    // Ignore
  }
}

export async function getServerStatus() {
  if (!cachedStatus || Date.now() - lastRefreshTime >= 15000) {
    await refreshStatus()
  }
  return cachedStatus
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  const { build } = buildInfo
  const serverMessage = await getServerStatus()

  res.send({
    success: true,
    build,
    serverMessage
  })
}
