import { createImage } from '../api/createImage'
import { trackEvent } from '../api/telemetry'
import { isValidHttpUrl } from './validationUtils'

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
  models: Array<string>
  negative?: string
  source_image?: string
  denoising_strength?: number
}

interface OrientationLookup {
  [key: string]: ImageOrientation
}

interface ImageOrientation {
  orientation: string
  height: number
  width: number
}

export const uploadImageConfig = {
  quality: 0.9,
  maxWidth: 1024,
  maxHeight: 1024
}

export const randomSampler = () => {
  const samplerArray = [
    'k_dpm_2_a',
    'k_dpm_2',
    'k_euler_a',
    'k_euler',
    'k_heun',
    'k_lms'
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // if (!img2img) {
  //   samplerArray.push('DDIM')
  //   samplerArray.push('PLMS')
  // }

  return samplerArray[Math.floor(Math.random() * samplerArray.length)]
}

export const orientationDetails = (
  orientation: string,
  height: number,
  width: number
): ImageOrientation => {
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
      orientation: 'landscape-16x9',
      height: 576,
      width: 1024
    },
    landscape: {
      orientation: 'landscape',
      height: 512,
      width: 768
    },
    portrait: {
      orientation: 'portrait',
      height: 768,
      width: 512
    },
    square: {
      orientation: 'square',
      height: 512,
      width: 512
    },
    'phone-bg': {
      orientation: 'phone-bg',
      height: 1024,
      width: 448
    },
    ultrawide: {
      orientation: 'ultrawide',
      height: 448,
      width: 1024
    }
  }

  if (orientation === 'custom') {
    return {
      orientation: 'custom',
      height: nearestWholeMultiple(height),
      width: nearestWholeMultiple(width)
    }
  }

  if (orientation === 'random') {
    const value =
      orientationIds[Math.floor(Math.random() * orientationIds.length)]

    return {
      ...lookup[value]
    }
  } else if (lookup[orientation]) {
    return {
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
  const clonedParams = Object.assign({}, imageParams)
  /**
   * Max prompt length for hlky is roughly 75 tokens.
   * According to: https://beta.openai.com/tokenizer
   * "One token is generally 4 chars of text". I believe
   * Stable Horde silently trims lengthy prompts. I do it
   * here, too, just so someone can't send Shakespeare
   * novels inside a payload.
   */
  clonedParams.prompt = imageParams.prompt.trim()
  if (clonedParams?.prompt?.length > 1024) {
    console.log(
      `Warning: prompt length of ${clonedParams.prompt.length} is greater than 1024 chars. Prompt will be shortned.`
    )
    clonedParams.prompt = clonedParams.prompt.substring(0, 1024)
  }

  // Image Validation
  clonedParams.negative = clonedParams?.negative?.trim()
  if (clonedParams?.negative) {
    clonedParams.prompt += ' ### ' + clonedParams.negative
  }

  if (
    isNaN(clonedParams.steps) ||
    clonedParams.steps > 200 ||
    clonedParams.steps < 1
  ) {
    clonedParams.steps = 200
  }

  if (
    isNaN(clonedParams.cfg_scale) ||
    clonedParams.cfg_scale > 32 ||
    clonedParams.cfg_scale < 1
  ) {
    clonedParams.cfg_scale = 32.0
  }

  try {
    const data = await createImage(clonedParams)
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
    trackEvent({
      event: 'UNABLE_TO_CREATE_IMAGE',
      context: 'imageUtils',
      imageParams: clonedParams
    })
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

export const imageDimensions = (fullDataString: string) => {
  return new Promise((resolve) => {
    var i = new Image()

    i.onload = function () {
      resolve({
        height: i.height,
        width: i.width
      })
    }

    // @ts-ignore
    i.src = fullDataString
  })
}

export const imgUrlToDataUrl = (url: string) => {
  return new Promise((resolve) => {
    try {
      var xhr = new XMLHttpRequest()
      xhr.onload = function () {
        var reader = new FileReader()
        reader.onloadend = function () {
          resolve(xhr.response)
        }
        reader.readAsDataURL(xhr.response)
      }
      xhr.onerror = function () {
        resolve(false)
      }
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.send()
    } catch (err) {
      resolve(false)
    }
  })
}

export const getImageFromUrl = async (imgUrl: string) => {
  const validUrl = isValidHttpUrl(imgUrl)

  if (!validUrl) {
    return {
      success: false,
      status: 'GET_IMG_FROM_URL_ERROR',
      message: 'Unable to process image from URL, please try something else.'
    }
  }

  const resp = await fetch(`/artbot/api/img-from-url`, {
    method: 'POST',
    body: JSON.stringify({
      imageUrl: imgUrl
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await resp.json()

  // @ts-ignore
  const { success, imageType, imgBase64String, height, width } = data

  if (!data || !success) {
    trackEvent({
      event: 'ERROR_UPLOAD_IMG_BY_URL',
      imgUrl
    })

    return {
      success: false,
      status: 'GET_IMG_FROM_URL_ERROR',
      message: 'Unable to process image from URL, please try something else.'
    }
  }

  trackEvent({
    event: 'UPLOAD_IMG_BY_URL',
    imgUrl
  })

  return {
    success: true,
    imgUrl,
    imageType,
    imgBase64String,
    height,
    width
  }
}

export const nearestWholeMultiple = (input: number, X = 64) => {
  let output = Math.round(input / X)
  if (output === 0 && input > 0) {
    output += 1
  }

  output *= X

  return output
}
