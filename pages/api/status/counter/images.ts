import type { NextApiRequest, NextApiResponse } from 'next'

// Prioritize ARTBOT_STATUS_API if available, fall back to STATUS_API
const statusApi = process.env.ARTBOT_STATUS_API || process.env.STATUS_API

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!statusApi) {
    return res.status(503).json({ error: 'Status API not configured' })
  }

  try {
    // Proxy the request to the external status API
    const response = await fetch(`${statusApi}/images/total`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Status API returned ${response.status}`)
    }

    const data = await response.json()

    // Cache for 2 seconds to reduce load on external API
    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate')
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch image count from status API:', error)
    res.status(500).json({ error: 'Failed to fetch image count' })
  }
}
