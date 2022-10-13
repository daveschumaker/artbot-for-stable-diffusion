import type { NextApiRequest, NextApiResponse } from 'next'
import { GenerateResponse } from '../../types'
import buildInfo from '../../build_info.json'

type Data = {
  success: boolean
  message?: string
  id?: string
  prompt?: string
  status?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { height, width, apikey, allowNsfw = false } = req.body
  let {
    prompt,
    steps,
    cfg_scale,
    sampler,
    negative = '',
    useTrusted
  } = req.body

  /**
   * Max prompt length for hlky is roughly 75 tokens.
   * According to: https://beta.openai.com/tokenizer
   * "One token is generally 4 chars of text". I believe
   * Stable Horde silently trims lengthy prompts. I do it
   * here, too, just so someone can't send Shakespeare
   * novels inside a payload.
   */
  if (!prompt || prompt?.length > 1024) {
    prompt = prompt.substring(0, 1024)
  }

  if (isNaN(steps) || steps > 100 || steps < 1) {
    steps = 100
  }

  if (isNaN(cfg_scale) || cfg_scale > 64 || cfg_scale < 1) {
    cfg_scale = 9.0
  }

  if (!sampler) {
    sampler = 'k_heun'
  }

  negative = negative.trim()

  if (negative) {
    prompt += ' ### ' + negative
  }

  const params = {
    prompt,
    params: {
      sampler_name: sampler,
      cfg_scale: Number(cfg_scale),
      height,
      width,
      steps: Number(steps)
    },
    nsfw: allowNsfw,
    trusted_workers: useTrusted
  }

  console.log(`build info??`, buildInfo)

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
    const { id, message = '' }: GenerateResponse = data

    if (message?.indexOf('No user matching sent API Key') >= 0) {
      return res.send({
        success: false,
        status: 'INVALID_API_KEY'
      })
    }

    if (
      message === 'Horde has enterred maintenance mode. Please try again later.'
    ) {
      return res.send({
        success: false,
        message,
        status: 'HORDE_OFFLINE'
      })
    }

    if (message === 'Input payload validation failed') {
      console.log(`Error: Invalid payload params.`)
      console.log(params)

      return res.send({
        success: false,
        message,
        status: 'INVALID_PARAMS'
      })
    }

    if (!id) {
      console.log('No id...', data)
      console.log(params)

      return res.send({
        success: false,
        message,
        status: 'MISSING_JOB_ID'
      })
    }

    console.log(
      `${new Date().toLocaleString()}: Generating image for jobId: ${id}`
    )
    console.log(`${height}h x ${width}w`)

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
