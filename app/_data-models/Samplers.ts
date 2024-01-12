import { MAX_STEPS_LOGGED_IN } from '_constants'
import { modelStore } from 'app/_store/modelStore'

class Samplers {
  static samplerDetails = () => {
    const { modelDetails } = modelStore.state
    // TODO: FIXME:
    // const loggedIn = userStore.state.loggedIn
    const loggedIn = false

    interface SamplerOptions {
      [key: string]: {
        supportsImg2Img?: boolean
        maxSteps: number
        modelValidation: (model: string) => boolean
      }
    }

    const data: SamplerOptions = {
      DDIM: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      dpmsolver: {
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model === 'stable_diffusion_2.0'
      },
      k_dpm_2_a: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 25,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpm_2: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 25,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_euler_a: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_euler: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_heun: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 25,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_lms: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpm_fast: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpm_adaptive: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpmpp_2m: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpmpp_2s_a: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      k_dpmpp_sde: {
        supportsImg2Img: true,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          model !== 'stable_diffusion_2.0'
      },
      lcm: {
        supportsImg2Img: false,
        maxSteps: loggedIn ? MAX_STEPS_LOGGED_IN : 50,
        modelValidation: (model: string = '') =>
          modelDetails[model] &&
          modelDetails[model].baseline === 'stable_diffusion_xl'
      }
    }

    return data
  }

  static dropdownOptions = ({
    model,
    isImg2Img = false
  }: {
    model: string
    isImg2Img?: boolean | string
  }) => {
    const options: Array<{ value: string; label: string }> = []

    for (const [key, value] of Object.entries(Samplers.samplerDetails())) {
      if (isImg2Img && value.supportsImg2Img === false) {
        continue
      }

      const validateModel =
        Samplers.samplerDetails()[key].modelValidation(model)

      if (!validateModel) {
        continue
      }

      options.push({
        value: key,
        label: key
      })
    }

    options.sort((a, b) => {
      const labelA = a.label.toLowerCase()
      const labelB = b.label.toLowerCase()

      if (labelA < labelB) {
        return -1
      }
      if (labelA > labelB) {
        return 1
      }
      return 0
    })

    if (model !== 'stable_diffusion_2.0') {
      options.push({ value: 'random', label: 'Random!' })
    }

    return options
  }

  static dropdownValue = (sampler: string) => {
    if (sampler === 'random') {
      return { value: 'random', label: 'Random!' }
    }

    return { label: sampler, value: sampler }
  }

  // TODO: Improve this
  static random = (steps = 20) => {
    // const loggedIn = userStore.state.loggedIn
    const loggedIn = false

    const samplerArray = [
      'k_dpm_2_a',
      'k_dpm_2',
      'k_euler_a',
      'k_euler',
      'k_heun',
      'k_lms'
    ]

    //   samplerArray.push('DDIM')
    //   samplerArray.push('PLMS')
    samplerArray.push('k_dpm_fast')
    samplerArray.push('k_dpm_adaptive')
    samplerArray.push('k_dpmpp_2m')
    samplerArray.push('k_dpmpp_2s_a')
    samplerArray.push('k_dpmpp_sde')

    if (loggedIn || steps <= 25) {
      return samplerArray[Math.floor(Math.random() * samplerArray.length)]
    } else {
      const limitedArray = [
        'k_euler_a',
        'k_euler',
        'k_dpm_fast',
        'k_dpm_adaptive',
        'k_dpmpp_2m'
      ]
      return limitedArray[Math.floor(Math.random() * limitedArray.length)]
    }
  }

  static validSamplersForImg2Img = () => {
    return [
      'DDIM',
      'k_dpm_2_a',
      'k_dpm_2',
      'k_euler_a',
      'k_euler',
      'k_heun',
      'k_lms'
    ]
  }
}

export default Samplers
