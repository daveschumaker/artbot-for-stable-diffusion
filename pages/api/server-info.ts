import type { NextApiRequest, NextApiResponse } from 'next'
import buildInfo from '../../build_info.json'
import { readServerSettingsFile } from 'app/_server-api/adminTools'

interface Notification {
  title: string
  content: string
  timestamp: number
}

type Data = {
  success: boolean
  build?: string
  cachedNotification?: Notification
  clusterSettings?: string
  serverMessage?: any
}

const cachedNotification = {
  title: '',
  content: '',
  timestamp: 0
}
let cachedStatus: any = null
let lastRefreshTime = 0

async function refreshStatus() {
  try {
    let data = await readServerSettingsFile()
    const serverSettings = data
    const { message = {}, notification = {} } = serverSettings

    if (message.title && message.content) {
      cachedStatus = {
        title: message.title,
        content: message.content,
        live: true
      }

      if (!isNaN(message.timestamp) && message.timestamp > 0) {
        cachedStatus.timestamp = message.timestamp
      }

      lastRefreshTime = Date.now()
    } else {
      cachedStatus = null
    }

    if (notification.title && notification.content) {
      cachedNotification.title = notification.title
      cachedNotification.content = notification.content
      cachedNotification.timestamp = notification.timestamp
    } else {
      cachedNotification.title = ''
      cachedNotification.content = ''
      cachedNotification.timestamp = 0
    }
  } catch (err) {
    // Ignore
  }
}

export async function getServerStatus() {
  if (!lastRefreshTime) {
    await refreshStatus()
  } else if (Date.now() - lastRefreshTime >= 15000) {
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
    serverMessage,
    cachedNotification
  })
}
