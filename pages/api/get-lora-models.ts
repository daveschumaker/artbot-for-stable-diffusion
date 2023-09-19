import Loras from 'app/_data-models/Loras'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  data: Loras | null
}

let loraCache: any = null

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(400).json({ success: false, data: null })
  }

  try {
    let data
    if (loraCache === null) {
      data = Loras.getModels()
      loraCache = data
    } else {
      data = loraCache
    }

    if (req.method === 'GET') {
      return res.send({
        success: true,
        data
      })
    }

    // TODO: Trigger words!
    // if (req.method === 'POST') {
    //   const { model } = req.body
    //   const data

    //   return res.send({
    //     model: {

    //     }
    //   })
    // }

    return res.status(400).json({ success: false, data: null })
  } catch (err) {
    res.send({
      success: false,
      data: null
    })
  }
}
