import {
  updateServerSettingsFile,
  validateToken
} from 'app/_server-api/adminTools'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
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

  if (!hasAuth) {
    return res.status(401).json({ success: false })
  }

  if (!req.body) {
    return res.status(400).json({ success: false })
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
