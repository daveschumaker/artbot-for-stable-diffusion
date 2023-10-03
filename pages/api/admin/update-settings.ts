// https://fb8a-137-184-35-72.ngrok-free.app/artbot/api/v1/shortlink/showcase/grK5Ohp0bPo

import {
  updateServerSettingsFile,
  validateToken
} from 'app/_server-api/adminTools'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  shortlink?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { authorization } = req.headers
  const hasAuth = await validateToken(authorization as string)

  if (!hasAuth || !req.body) {
    return res.send({
      success: true
    })
  }

  if (hasAuth) {
    await updateServerSettingsFile(JSON.parse(req.body))

    try {
      res.send({
        success: true
      })
    } catch (err) {
      console.log(`Error: Unable to update server settings.`)
      console.log(err)
      res.send({
        success: false
      })
    }
  }
}
