import { createImage } from '../api/createImage'
import { ModelDetails } from '../types'

interface CreateImageJob {
  jobId?: string
  img2img?: boolean
  prompt: string
  height: number
  width: number
  cfg_scale: number
  steps: number
  sampler: string
  seed?: string
  numImages?: number
  parentJobId?: string
  models: Array<ModelDetails>
  negative?: string
  source_image?: string
  denoising_strength?: number
}

interface OrientationLookup {
  [key: string]: ImageOrientation
}

interface ImageOrientation {
  orientation?: string
  height: number
  width: number
}

export const randomSampler = (img2img: boolean) => {
  const samplerArray = [
    'k_dpm_2_a',
    'k_dpm_2',
    'k_euler_a',
    'k_euler',
    'k_heun',
    'k_lms'
  ]

  if (img2img) {
    samplerArray.push('DDIM')
    samplerArray.push('PLMS')
  }

  return samplerArray[Math.floor(Math.random() * samplerArray.length)]
}

export const orientationDetails = (orientation: string): ImageOrientation => {
  const orientationIds = [
    'landscape-16x9',
    'landscape',
    'phone-bg',
    'portrait',
    'square',
    'ultrawide'
  ]
  const lookup: OrientationLookup = {
    'landscape-16x9': {
      height: 576,
      width: 1024
    },
    landscape: {
      height: 512,
      width: 768
    },
    portrait: {
      height: 768,
      width: 512
    },
    square: {
      height: 512,
      width: 512
    },
    'phone-bg': {
      height: 1024,
      width: 448
    },
    ultrawide: {
      height: 448,
      width: 1024
    }
  }

  if (orientation === 'random') {
    const value =
      orientationIds[Math.floor(Math.random() * orientationIds.length)]

    return {
      orientation: value,
      ...lookup[value]
    }
  } else if (lookup[orientation]) {
    return {
      orientation,
      ...lookup[orientation]
    }
  }

  return {
    orientation: 'square',
    height: 512,
    width: 512
  }
}

export const createNewImage = async (imageParams: CreateImageJob) => {
  /**
   * Max prompt length for hlky is roughly 75 tokens.
   * According to: https://beta.openai.com/tokenizer
   * "One token is generally 4 chars of text". I believe
   * Stable Horde silently trims lengthy prompts. I do it
   * here, too, just so someone can't send Shakespeare
   * novels inside a payload.
   */
  imageParams.prompt = imageParams.prompt.trim()
  if (imageParams?.prompt?.length > 1024) {
    console.log(
      `Warning: prompt length of ${imageParams.prompt.length} is greater than 1024 chars. Prompt will be shortned.`
    )
    imageParams.prompt = imageParams.prompt.substring(0, 1024)
  }

  // Image Validation
  imageParams.negative = imageParams?.negative?.trim()
  if (imageParams?.negative) {
    imageParams.prompt += ' ### ' + imageParams.negative
  }

  if (
    isNaN(imageParams.steps) ||
    imageParams.steps > 100 ||
    imageParams.steps < 1
  ) {
    imageParams.steps = 30
  }

  if (
    isNaN(imageParams.cfg_scale) ||
    imageParams.cfg_scale > 64 ||
    imageParams.cfg_scale < 1
  ) {
    imageParams.cfg_scale = 9.0
  }

  try {
    const data = await createImage(imageParams)
    const { jobId, success, message, status } = data

    if (success && jobId) {
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
  } catch (err) {
    return {
      success: false,
      message: 'Unable to create image.'
    }
  }
}

export const getBase64 = (file: Blob) => {
  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      return resolve(reader.result)
    }
  })
}
