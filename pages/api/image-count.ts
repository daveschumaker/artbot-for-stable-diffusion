import type { NextApiRequest, NextApiResponse } from 'next'
import { basePath } from 'BASE_PATH'

type Data = {
  success: boolean
  message?: string
}

/**
 * @deprecated This endpoint is deprecated. Use /api/status/counter/images instead.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Return 301 redirect to new endpoint
  // Location is sent as it is, so it needs the base path that Next adds to
  // its own links.
  res.setHeader('Location', `${basePath}/api/status/counter/images`)
  res.status(301).json({
    success: false,
    message: 'This endpoint has been moved to /api/status/counter/images'
  })
}
