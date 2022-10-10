import { CreateImageJob } from '../types'

export const createNewImage = async (imageParams: CreateImageJob) => {
  const apikey = localStorage.getItem('apikey')?.trim() || '0000000000'
  const useTrusted = localStorage.getItem('useTrusted') || false

  const params: CreateImageJob = {
    prompt: imageParams.prompt,
    height: imageParams.height || 512,
    width: imageParams.width || 512,
    cfg_scale: imageParams.cfg_scale || '12.0',
    steps: imageParams.steps || 50,
    sampler: imageParams.sampler || 'k_euler_a',
    useTrusted: useTrusted === 'true' ? true : false
  }

  if (imageParams.negative) {
    params.negative = imageParams.negative
  }

  if (imageParams.seed) {
    params.seed = imageParams.seed
  }

  const res = await fetch(`/artbot/api/create`, {
    method: 'POST',
    body: JSON.stringify(Object.assign({}, params, { apikey })),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  const { id: jobId, message, status } = data

  if (jobId) {
    return {
      success: true,
      jobId
    }
  } else {
    return {
      success: false,
      message,
      status
    }
  }
}
