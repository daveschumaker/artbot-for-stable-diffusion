// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { GenerateResponse } from '../../types'

type Data = {
  success: boolean
  message?: string
  id?: string
  prompt?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { height, width, apikey } = req.body
  let { prompt, steps, cfg_scale, sampler } = req.body

  if (!prompt || prompt?.length > 325) {
    prompt = prompt.substring(0, 325)
  }

  if (isNaN(steps) || steps > 250 || steps < 1) {
    steps = 64
  }

  if (isNaN(cfg_scale) || cfg_scale > 64 || cfg_scale < 1) {
    cfg_scale = 9.0
  }

  if (!sampler) {
    sampler = 'k_euler_a'
  }

  const params = {
    prompt,
    params: {
      sampler_name: sampler,
      cfg_scale,
      height,
      width,
      steps
    }
  }

  try {
    const resp = await fetch(`https://stablehorde.net/api/v2/generate/async`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        apikey: apikey
      }
    })

    const data = await resp.json()
    const { id, message }: GenerateResponse = data

    if (
      message === 'Horde has enterred maintenance mode. Please try again later.'
    ) {
      return res.send({
        success: false,
        message
      })
    }

    res.send({
      success: true,
      id,
      prompt
    })
  } catch (err) {
    console.log(`Error: Unable to create image.`)
    console.log(err)
    res.send({
      success: false,
      message: 'Unable to create image. Please try again soon.'
    })
  }
}
