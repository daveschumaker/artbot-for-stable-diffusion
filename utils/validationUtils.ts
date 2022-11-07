interface Samplers {
  [key: string]: number
}
export const maxSteps = (sampler: string, loggedIn: boolean = false) => {
  const anonMaxSteps: Samplers = {
    k_dpm_2_a: 50,
    k_dpm_2: 50,
    k_euler_a: 100,
    k_euler: 100,
    k_heun: 50,
    k_lms: 50,
    k_dpm_fast: 100,
    k_dpm_adaptive: 100,
    k_dpmpp_2m: 100,
    k_dpmpp_2s_a: 50,
    random: 50
  }

  if (loggedIn) {
    return 500
  }

  return anonMaxSteps[sampler]
}

export const validSampler = (sampler: string) => {
  const samplers = [
    'k_dpm_2_a',
    'k_dpm_2',
    'k_euler_a',
    'k_euler',
    'k_heun',
    'k_lms',
    'k_dpm_fast',
    'k_dpm_adaptive',
    'k_dpmpp_2m',
    'k_dpmpp_2s_a',
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
