import { adminLogin, validateToken } from 'app/_server-api/adminTools'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure
} from 'app/_server-api/loginRateLimit'

type Data = {
  success: boolean
  token?: string
}

const getClientAddress = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  const [first] = String(forwarded ?? '').split(',')

  return first.trim() || req.socket?.remoteAddress || 'unknown'
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

  const client = getClientAddress(req)

  if (isLoginBlocked(client)) {
    return res.status(429).json({ success: false })
  }

  let credentials

  try {
    credentials = JSON.parse(req.body)
  } catch (err) {
    return res.status(400).json({ success: false })
  }

  const { success, token } = adminLogin(credentials ?? {})

  if (success) {
    clearLoginFailures(client)
  } else {
    recordLoginFailure(client)
  }

  res.send({
    success,
    token
  })
}
