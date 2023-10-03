// https://fb8a-137-184-35-72.ngrok-free.app/artbot/api/v1/shortlink/showcase/grK5Ohp0bPo

import { validateToken } from 'app/_server-api/adminTools'
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

  const { shortlink } = req.query
  const { authorization } = req.headers

  const hasAuth = await validateToken(authorization as string)

  if (hasAuth) {
    try {
      const resp = await fetch(
        `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/showcase/${shortlink}`
      )

      const { success }: { success: boolean } = await resp.json()

      if (success) {
        return res.send({
          success: true,
          shortlink
        })
      } else {
        res.send({
          success: false
        })
      }
    } catch (err) {
      console.log(`Error: Unable to publish to showcase.`)
      console.log(err)
      res.send({
        success: false
      })
    }
  }
}
