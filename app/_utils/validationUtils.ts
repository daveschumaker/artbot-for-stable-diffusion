interface Samplers {
  [key: string]: number
}

export const maxSteps = ({
  sampler = '',
  loggedIn = false,
  isSlider = false
}) => {
  const anonMaxSteps: Samplers = {
    DDIM: 50,
    k_dpm_2_a: 25,
    k_dpm_2: 25,
    k_euler_a: 50,
    k_euler: 50,
    k_heun: 25,
    k_lms: 50,
    k_dpm_fast: 50,
    k_dpm_adaptive: 50,
    k_dpmpp_2m: 50,
    k_dpmpp_2s_a: 50,
    k_dpmpp_sde: 50,
    random: 25
  }

  if (loggedIn && isSlider) {
    return 150
  }

  if (loggedIn) {
    return 500
  }

  return anonMaxSteps[sampler]
}

interface IHasMask {
  source_mask: string
}

export const hasMask = (input: IHasMask) => {
  if (input.source_mask) {
    return true
  }

  return false
}

interface IHasImg {
  source_image: string
}

export const hasSourceImg = (input: IHasImg) => {
  if (input.source_image && typeof input.source_image === 'string') {
    return true
  }

  return false
}

export const validSampler = (sampler: string) => {
  const samplers = [
    'DDIM',
    'dpmsolver',
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
    'k_dpmpp_sde',
    'random'
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // if (!img2img) {
  //   samplers.push('PLMS')
  //   samplers.push('DDIM')
  // }

  return samplers.indexOf(sampler) >= 0
}

export const isValidHttpUrl = (string: string = '') => {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const promptSafetyExclusions = (prompt: string, model: string) => {
  prompt = prompt.toLowerCase()
  prompt = prompt.split('###')[0]

  if (model === 'Hentai Diffusion') {
    prompt = prompt.replace('1girl', '')
    prompt = prompt.replace('1boy', '')
  }

  prompt = prompt.replace('cowboy', '')
  prompt = prompt.replace('destiny', '')

  return prompt
}

export const validatePromptSafety = (prompt: string) => {
  prompt = prompt.toLowerCase()
  const regex = /girl|boy|student|young|lit[tl]le|\blil\b|small|tiny/gm
  return prompt.match(regex)
}

export const arrayHasValue = (arr: any[]) => {
  if (!arr) return false

  if (!Array.isArray(arr)) return false

  return arr.length > 0
}
