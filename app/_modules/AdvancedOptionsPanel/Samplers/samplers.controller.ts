export const samplerOptions = (input: any) => {
  if (input.models[0] === 'stable_diffusion_2.0') {
    return [{ value: 'dpmsolver', label: 'dpmsolver' }]
  }

  const options = [
    { value: 'DDIM', label: 'DDIM' },
    { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
    { value: 'k_dpm_2', label: 'k_dpm_2' },
    { value: 'k_euler_a', label: 'k_euler_a' },
    { value: 'k_euler', label: 'k_euler' },
    { value: 'k_heun', label: 'k_heun' },
    { value: 'k_lms', label: 'k_lms' }
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // Temporarily hide DDIM and PLMS based on convo with db0:
  // DDIM never worked in nataili. That reminds me, @Stable Horde: Integrator can you hide DDIM and PLMS until we get them working properly?
  // if (!img2img) {
  //   options.unshift({ value: 'PLMS', label: 'PLMS' })
  //   options.unshift({ value: 'DDIM', label: 'DDIM' })
  // }

  // Per hlky, these samplers do not currently work for img2img
  if (!input.source_image) {
    options.push({ value: 'k_dpm_fast', label: 'k_dpm_fast' })
    options.push({ value: 'k_dpm_adaptive', label: 'k_dpm_adaptive' })
    options.push({ value: 'k_dpmpp_2m', label: 'k_dpmpp_2m' })
    options.push({ value: 'k_dpmpp_2s_a', label: 'k_dpmpp_2s_a' })
    options.push({ value: 'k_dpmpp_sde', label: 'k_dpmpp_sde' })
  }

  options.push({ value: 'random', label: 'random' })

  return options
}
