export const validSampler = (sampler: string) => {
  const samplers = [
    'k_dpm_2_a',
    'k_dpm_2',
    'k_euler_a',
    'k_euler',
    'k_heun',
    'k_lms',
    'random'
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // if (!img2img) {
  //   samplers.push('PLMS')
  //   samplers.push('DDIM')
  // }

  return samplers.indexOf(sampler) >= 0
}

export const isValidHttpUrl = (string: string) => {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
