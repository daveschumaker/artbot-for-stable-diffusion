import { createImage } from '../api/createImage'
import { trackEvent } from '../api/telemetry'
import { userInfoStore } from '../store/userStore'
import { isValidHttpUrl } from './validationUtils'

interface CreateImageJob {
  base64String?: string
  jobId?: string
  img2img?: boolean
  prompt: string
  height: number
  width: number
  cfg_scale: number
  steps: number
  sampler: string
  karras: boolean
  seed?: string
  numImages?: number
  parentJobId?: string
  models: Array<string>
  negative?: string
  source_image?: string
  source_mask?: string
  denoising_strength?: number
  post_processing: Array<string>

  has_source_image?: boolean
  has_source_mask?: boolean
  canvasStore?: any
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

export const randomSampler = (steps: number, isImg2Img: boolean) => {
  const loggedIn = userInfoStore.state.loggedIn

  const samplerArray = [
    'k_dpm_2_a',
    'k_dpm_2',
    'k_euler_a',
    'k_euler',
    'k_heun',
    'k_lms'
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  if (!isImg2Img) {
    //   samplerArray.push('DDIM')
    //   samplerArray.push('PLMS')
    samplerArray.push('k_dpm_fast')
    samplerArray.push('k_dpm_adaptive')
    samplerArray.push('k_dpmpp_2m')
    samplerArray.push('k_dpmpp_2s_a')
  }

  if (loggedIn || steps <= 25) {
    return samplerArray[Math.floor(Math.random() * samplerArray.length)]
  } else if (!isImg2Img) {
    const limitedArray = [
      'k_euler_a',
      'k_euler',
      'k_dpm_fast',
      'k_dpm_adaptive',
      'k_dpmpp_2m'
    ]
    return limitedArray[Math.floor(Math.random() * limitedArray.length)]
  } else {
    const limitedArray = ['k_euler_a', 'k_euler']
    return limitedArray[Math.floor(Math.random() * limitedArray.length)]
  }
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
      height: 768,
      width: 768
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
    } else if (!success && status !== 'WAITING_FOR_PENDING_JOB') {
      if (clonedParams.source_image) {
        clonedParams.has_source_image = true
      }

      if (clonedParams.source_mask) {
        clonedParams.has_source_mask = true
      }

      delete clonedParams.base64String
      delete clonedParams.source_image
      delete clonedParams.source_mask
      delete clonedParams.canvasStore

      trackEvent({
        event: 'ERROR',
        action: 'UNABLE_TO_CREATE_IMAGE',
        context: 'imageUtils',
        data: {
          imageParams: clonedParams
        }
      })
      return {
        success: false,
        message,
        status
      }
    }
  } catch (err) {
    if (clonedParams.source_image) {
      clonedParams.has_source_image = true
    }

    if (clonedParams.source_mask) {
      clonedParams.has_source_mask = true
    }

    delete clonedParams.base64String
    delete clonedParams.source_image
    delete clonedParams.source_mask
    delete clonedParams.canvasStore

    trackEvent({
      event: 'ERROR',
      action: 'UNABLE_TO_CREATE_IMAGE',
      context: 'imageUtils',
      data: {
        imageParams: clonedParams
      }
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

export const base64toBlob = (base64Data: string, contentType: string) => {
  contentType = contentType || ''
  var sliceSize = 1024
  var byteCharacters = atob(base64Data)
  var bytesLength = byteCharacters.length
  var slicesCount = Math.ceil(bytesLength / sliceSize)
  var byteArrays = new Array(slicesCount)

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize
    var end = Math.min(begin + sliceSize, bytesLength)

    var bytes = new Array(end - begin)
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
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
      context: 'imageUtils',
      data: {
        imgUrl
      }
    })

    return {
      success: false,
      status: 'GET_IMG_FROM_URL_ERROR',
      message: 'Unable to process image from URL, please try something else.'
    }
  }

  trackEvent({
    event: 'UPLOAD_IMG_BY_URL',
    context: 'imageUtils',
    data: {
      imgUrl
    }
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
