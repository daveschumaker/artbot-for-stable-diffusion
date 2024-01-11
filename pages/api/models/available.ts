import { server_fetchModelsAvailableV2 } from 'app/_server-api/server_fetchModelsAvailableV2'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  models?: any
  timestamp?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false })
  }

  try {
    const data = await server_fetchModelsAvailableV2()

    return res.send({
      success: true,
      models: data
    })
  } catch (err) {
    return res.send({
      success: true,
      models: []
    })
  }
}
