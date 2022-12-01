import type { NextApiRequest, NextApiResponse } from 'next'
import buildInfo from '../../build_info.json'

type Data = {
  success: boolean
  build?: string
  message?: string
  enrollPct?: number
  showBetaOption?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  const { build } = buildInfo
  let message = ''
  let enrollPct = 0
  let showBetaOption = false

  try {
    const resp = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/status/message`,
      {
        method: 'GET'
      }
    )

    const data = (await resp.json()) || {}
    message = data.message
    enrollPct = data.enrollPct
    showBetaOption = data.showBetaOption
  } catch (err) {}

  res.send({
    success: true,
    build,
    message,
    enrollPct,
    showBetaOption
  })
}
