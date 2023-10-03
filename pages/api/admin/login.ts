import { adminLogin, validateToken } from 'app/_server-api/adminTools'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  token?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  if (!req.body && req.headers.authorization) {
    const hasAuth = await validateToken(req.headers.authorization as string)

    if (hasAuth) {
      return res.send({
        success: true,
        token: req.headers.authorization
      })
    }
  }

  if (!req.body) {
    return res.send({
      success: false
    })
  }

  const data = JSON.parse(req.body)
  const { success, token } = adminLogin(data)

  res.send({
    success,
    token
  })
}
