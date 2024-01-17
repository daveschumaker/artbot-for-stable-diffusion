import { createImage } from 'app/_api/createImage'
import { trackEvent } from 'app/_api/telemetry'
import { userInfoStore } from 'app/_store/userStore'
import { initBlob } from './blobUtils'
import { SourceProcessing } from './promptUtils'
import { isValidHttpUrl } from './validationUtils'
import { hasPromptMatrix, promptMatrix } from './promptUtils'
import AppSettings from 'app/_data-models/AppSettings'
import { DEFAULT_SAMPLER_ARRAY } from '_constants'
import { isiOS, isSafariBrowser } from './appUtils'
import { fetchCompletedJobs } from './db'
import { basePath } from 'BASE_PATH'
import ImageModels from 'app/_data-models/ImageModels'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { CreateImageJob } from '_types'
interface OrientationLookup {
  [key: string]: ImageOrientation
}

interface ImageOrientation {
  orientation: string
  height: number
  width: number
}

export const cropToNearest64 = (base64str: string) => {
  return new Promise((resolve, reject) => {
    base64str = `data:${inferMimeTypeFromBase64(base64str)};base64,${base64str}`

    // Create a new image element
    const img = new Image()
    img.onload = function () {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate the new dimensions divisible by 64
      const newWidth = img.width - (img.width % 64)
      const newHeight = img.height - (img.height % 64)

      // Calculate the starting position to keep the image centered
      const startX = (img.width - newWidth) / 2
      const startY = (img.height - newHeight) / 2

      // Set the canvas dimensions and draw the cropped image
      canvas.width = newWidth
      canvas.height = newHeight
      ctx?.drawImage(
        img,
        startX,
        startY,
        newWidth,
        newHeight,
        0,
        0,
        newWidth,
        newHeight
      )

      // Convert the canvas back to base64 string
      const croppedBase64 = canvas.toDataURL()
      const [, imgBase64String] = croppedBase64.split(';base64,')

      // Return the cropped base64 string, new width, and new height via callback
      resolve({ croppedBase64: imgBase64String, newWidth, newHeight })
    }
    img.onerror = reject
    img.src = base64str
  })
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
    samplerArray.push('k_dpmpp_sde')
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
  height: number = 512,
  width: number = 512
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

export const getImageDimensions = (name: string = '', base64String: string) => {
  let fullString = base64String

  if (base64String.indexOf('data:') !== 0) {
    fullString = `data:${inferMimeTypeFromBase64(
      base64String
    )};base64,${base64String}`
  }

  return new Promise((resolve, reject) => {
    // Create a new Image object
    const image = new Image()

    // Set up the onload function, which fires after the image has been loaded
    image.onload = function () {
      console.log(`${name} dimensions:`)
      // @ts-ignore
      console.log(`image w x h:`, this.width, this.height)

      // Resolve the promise with an object containing the width and height
      // @ts-ignore
      resolve({ width: this.width, height: this.height })
    }

    // Set up the onerror function, which fires if there's an error loading the image
    image.onerror = function () {
      // Reject the promise if there's an error
      reject(new Error('Could not load image'))
    }

    // Set the source of the image to the base64 string
    image.src = fullString
  })
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
  // clonedParams.prompt = imageParams.prompt.trim()
  // if (clonedParams?.prompt?.length > 1024) {
  //   console.log(
  //     `Warning: prompt length of ${clonedParams.prompt.length} is greater than 1024 chars. Prompt will be shortned.`
  //   )
  //   clonedParams.prompt = clonedParams.prompt.substring(0, 1024)
  // }

  if (
    isNaN(clonedParams.steps) ||
    clonedParams.steps > 500 ||
    clonedParams.steps < 1
  ) {
    clonedParams.steps = 20
  }

  if (
    isNaN(clonedParams.cfg_scale) ||
    clonedParams.cfg_scale > 32 ||
    clonedParams.cfg_scale < 1
  ) {
    clonedParams.cfg_scale = 32.0
  }

  try {
    // @ts-ignore
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

      if (clonedParams.source_image) {
        clonedParams.source_image = '[ true ]'
      }

      if (clonedParams.source_mask) {
        clonedParams.source_mask = '[ true ]'
      }

      if (clonedParams.maskData) {
        clonedParams.maskData = '[ true ]'
      }

      if (clonedParams.canvasData) {
        clonedParams.canvasData = '[ true ]'
      }

      if (clonedParams.canvasStore) {
        delete clonedParams.canvasStore
      }

      trackEvent({
        event: 'ERROR',
        action: 'UNABLE_TO_CREATE_IMAGE',
        context: 'imageUtils',
        data: {
          imageParams: clonedParams,
          status,
          message
        }
      })
      return {
        success: false,
        message,
        status
      }
    }
  } catch (err: any) {
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
        imageParams: clonedParams,
        errorMessage: err.message
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

export const base64toBlobUrl = async (base64Data: string) => {
  const contentType = inferMimeTypeFromBase64(base64Data)
  const base64 = `data:${contentType};base64,${base64Data}`

  try {
    const response = await fetch(base64)
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error converting base64 to Blob URL:', error)
    return null
  }
}

export const base64toBlob = async (base64Data: string) => {
  try {
    const base64str = `data:${inferMimeTypeFromBase64(
      base64Data
    )};base64,${base64Data}`
    const base64Response = await fetch(base64str)
    const blob = await base64Response.blob()

    return blob
  } catch (err) {
    return ''
  }
}

export const imageDimensions = (fullDataString: string) => {
  if (
    fullDataString.indexOf('data:image/') !== 0 &&
    !fullDataString.includes('data:image/webp;base64,')
  ) {
    fullDataString = `data:image/webp;base64,` + fullDataString
  }

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

  const resp = await fetch(`${basePath}/api/img-from-url`, {
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

interface IPresetParams {
  prompt: string
  negative: string
  stylePreset: string
}

export const modifyPromptForStylePreset = ({
  prompt = '',
  negative = '',
  stylePreset = 'none'
}: IPresetParams) => {
  let stylePresetPrompt = ''
  let stylePresetNeg = ''

  // If it exists, split negative part off of whole prompt,
  // so it can be combined with preset negative prompt.
  let [initPrompt = '', splitNegative = ''] = prompt.split('###')

  // Combine negative split from prompt with actual negative string:
  splitNegative = splitNegative + ' ' + negative.trim()

  if (stylePreset !== 'none') {
    // Replace key in preset style text
    const regex = /{p}/i
    stylePresetPrompt = stylePresetPrompt.replace(regex, initPrompt.trim())
  } else {
    stylePresetPrompt = initPrompt
    stylePresetNeg = splitNegative.trim()
  }

  // Handle negative prompt
  if (stylePresetNeg && splitNegative.trim()) {
    let negRegex = /{np}/i
    stylePresetNeg = stylePresetNeg.replace(negRegex, splitNegative.trim())
    stylePresetPrompt = stylePresetPrompt + ' ### ' + stylePresetNeg
  } else if (stylePresetNeg && stylePresetNeg.indexOf('{np}') >= 0) {
    let negRegex = /{np}/i
    stylePresetNeg = stylePresetNeg.replace(negRegex, '')
    stylePresetPrompt = stylePresetPrompt + ' ### ' + stylePresetNeg
  } else if (stylePresetNeg && stylePresetNeg.indexOf('{np}') === -1) {
    stylePresetPrompt = stylePresetPrompt + ' ### ' + stylePresetNeg
  }

  return stylePresetPrompt
}

export const kudosCost = ({
  width,
  height,
  steps,
  numImages,
  postProcessors,
  sampler,
  control_type,
  prompt = '',
  negativePrompt = ''
}: {
  width: number
  height: number
  steps: number
  numImages: number
  postProcessors: Array<string>
  sampler: string
  control_type: string
  prompt: string
  negativePrompt: string
}): number => {
  const combinePrompts = `${prompt} ${negativePrompt}`
  const numWeights = combinePrompts.match(/\(.+?\)/g) || []

  const result =
    Math.pow((width as number) * (height as number) - 64 * 64, 1.75) /
    Math.pow(1024 * 1024 - 64 * 64, 1.75)

  let kudos =
    0.1232 * (steps as number) + result * (0.1232 * (steps as number) * 8.75)

  const processingCost =
    kudos *
    numImages *
    (/dpm_2|dpm_2_a|k_heun/.test(sampler) ? 2 : 1) *
    (1 + (postProcessors.includes('RealESRGAN_x4plus') ? 0.2 * 1 + 0.3 : 0))

  const weightedCost = numWeights.length * numImages
  const totalCost = processingCost + weightedCost

  if (!control_type) {
    return Math.round(totalCost)
  } else {
    return Math.round(totalCost * 3)
  }
}

export const blobToClipboard = async (base64String: string) => {
  initBlob()

  const makeImagePromiseForSafari = async () => {
    const base64Response = await fetch(`data:image/png;base64,${base64String}`)
    const imgBlob = await base64Response.blob()

    // @ts-ignore
    return await imgBlob.toPNG()
  }

  if (isiOS() || isSafariBrowser()) {
    try {
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': makeImagePromiseForSafari()
        })
      ])

      return true
    } catch (err) {
      return false
    }
  } else {
    // Only PNGs can be copied to the clipboard
    const image: any = await base64toBlob(base64String)
    const newBlob = await image.toPNG()

    navigator.clipboard.write([new ClipboardItem({ 'image/png': newBlob })])
    return true
  }
}
export const downloadImages = async ({
  imageArray = [],
  offset = 0,
  limit = 0,
  sort = '',
  callback = () => {}
}: any) => {
  if (offset >= 0 && limit > 0) {
    imageArray = await fetchCompletedJobs({ offset, limit, sort })
  }

  initBlob()

  const { downloadZip } = await import('client-zip')
  const fileDetails: any = []
  const fileArray: any = []

  let currentIndex = offset
  for (const imageId in imageArray) {
    const image: any = imageArray[imageId]

    if (!image || !image.base64String) {
      continue
    }

    let fileType = AppSettings.get('imageDownloadFormat') || 'jpg'
    let filename = `image_${imageId}.${fileType}`

    if (image.prompt) {
      filename =
        image.id +
        '_' +
        image.prompt
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .slice(0, 125) +
        `_${imageId}.${fileType}`
    }

    const imageData = {
      name: filename,
      date: new Date(image.timestamp),
      prompt: image.prompt,
      negative_prompt: image.negative,
      sampler: image.sampler,
      model: image.models ? image.models[0] : image.model || 'stable_diffusion',
      loras: image.loras,
      height: image.height,
      width: image.width,
      steps: Number(image.steps),
      cfg_scale: Number(image.cfg_scale),
      seed: image.seed
    }

    if (image.img2img || image.source_processing === SourceProcessing.Img2Img) {
      // @ts-ignore
      imageData.denoising_strength = image.denoising_strength
    }

    fileDetails.push(imageData)
    let newBlob

    let input
    try {
      input = await base64toBlob(image.base64String)
    } catch (err) {
      console.log(
        `Error: Something unfortunate happened when attempting to convert base64string to file blob`
      )
      console.log(err)
      continue
    }

    try {
      if (image.imageMimeType !== `image/${fileType}`) {
        if (input) {
          if (fileType === 'png') {
            // @ts-ignore
            newBlob = await input?.toPNG()
          }

          if (fileType === 'jpg') {
            // @ts-ignore
            newBlob = await input?.toJPEG()
          }

          if (fileType === 'webp') {
            // @ts-ignore
            newBlob = await input?.toWebP()
          }
        }
      } else {
        newBlob = input
      }
      fileArray.push({
        name: filename,
        lastModified: new Date(image.timestamp),
        input: newBlob
      })
    } catch (err) {
      console.log(`Error converting image to ${fileType}...`)
      console.log(image.jobId)
      continue
    }

    callback({
      currentIndex
    })

    currentIndex++
  }

  if (fileArray.length === 0) {
    console.log(`Error: No image files found within zip file. Aborting.`)
    callback({ done: true, error: true })
    return
  }

  const jsonDetails = {
    name: '_image_details.json',
    lastModified: new Date(),
    input: JSON.stringify(fileDetails, null, 2)
  }

  const date = new Date()
  const dateString = date.toISOString().substring(0, 19).replace('T', '-')
  let zipFilename = `artbot-image-export-${dateString}.zip`

  if (offset >= 0 && limit > 0) {
    zipFilename = `artbot-image-export-${offset}-to-${
      offset + limit
    }-${dateString}.zip`
  }

  callback({ done: true })
  const blob = await downloadZip([jsonDetails, ...fileArray]).blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = zipFilename
  link.click()
  link.remove()
}

export const downloadFile = async (image: any) => {
  initBlob()
  const fileType = AppSettings.get('imageDownloadFormat') || 'jpg'
  const input = await base64toBlob(image.base64String)
  const { saveAs } = (await import('file-saver')).default

  const filename =
    image.prompt
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .slice(0, 124) + `.${fileType}`

  //don't convert files that are already in the right format..........☹
  if (image.imageMimeType == `image/${fileType}`) {
    saveAs(input, filename)
  } else {
    // otherwise we'll convert if necessary
    let newBlob

    if (fileType === 'png') {
      // @ts-ignore
      newBlob = await input?.toPNG(null)
    }

    if (fileType === 'jpg') {
      // @ts-ignore
      newBlob = await input?.toJPEG(null)
    }

    if (fileType === 'webp') {
      // @ts-ignore
      newBlob = await input?.toWebP(null)
    }

    saveAs(newBlob, filename)
  }
}

interface ICountImages {
  numImages: number
  source_image?: string
  multiSamplers?: string[]
  multiSteps?: string
  multiClip?: string
  multiDenoise?: string
  multiGuidance?: string
  useAllModels?: boolean
  useFavoriteModels?: boolean
  useAllSamplers?: boolean
  useMultiClip?: boolean
  useMultiDenoise?: boolean
  useMultiSamplers?: boolean
  useMultiSteps?: boolean
  useMultiGuidance?: boolean
  prompt?: string
  negative?: string
  models?: Array<string>
}

export const calculateAspectRatioFit = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return { width: srcWidth * ratio, height: srcHeight * ratio }
}

export const countImagesToGenerate = (imageParams: ICountImages) => {
  const {
    numImages = 0,
    multiSteps = '',
    multiClip = '',
    multiDenoise = '',
    multiGuidance = '',
    multiSamplers = [],
    useAllModels = false,
    useFavoriteModels = false,
    useAllSamplers = false,
    useMultiClip = false,
    useMultiDenoise = false,
    useMultiGuidance = false,
    useMultiSamplers = false,
    useMultiSteps = false,
    models = [],
    prompt = '',
    negative = ''
  } = imageParams
  let imageCount = numImages

  if (useMultiClip) {
    let splitClip = multiClip.split(',') || []
    let splitCount = 0

    splitClip.forEach((split) => {
      // @ts-ignore
      if (!isNaN(split) && split) {
        splitCount++
      }
    })

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (useMultiDenoise && imageParams.source_image) {
    let splitDenoise = multiDenoise.split(',') || []
    let splitCount = 0

    splitDenoise.forEach((split) => {
      // @ts-ignore
      if (!isNaN(split) && split) {
        splitCount++
      }
    })

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (useMultiSamplers) {
    let splitCount = multiSamplers.length

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (useMultiSteps) {
    let splitSteps = multiSteps.split(',') || []
    let splitCount = 0

    splitSteps.forEach((split) => {
      // @ts-ignore
      if (!isNaN(split) && split) {
        splitCount++
      }
    })

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (useMultiGuidance) {
    let splitGuidance = multiGuidance.split(',') || []
    let splitCount = 0

    splitGuidance.forEach((split) => {
      // @ts-ignore
      if (!isNaN(split) && split) {
        splitCount++
      }
    })

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (hasPromptMatrix(prompt) || hasPromptMatrix(negative)) {
    const matrixPrompts = [...promptMatrix(prompt)] || ['']
    const matrixNegative = [...promptMatrix(negative)] || ['']

    const promptLength = matrixPrompts.length > 0 ? matrixPrompts.length : 1
    const negLength = matrixNegative.length > 0 ? matrixNegative.length : 1

    imageCount = imageCount * (promptLength * negLength)
  }

  if (models.length > 1) {
    imageCount = imageCount * models.length
  }

  if (useAllModels) {
    const filteredModels = ImageModels.getValidModels({
      input: imageParams as unknown as DefaultPromptInput
    })
    const modelsArray = filteredModels.map((obj) => obj.name)
    imageCount = imageCount * modelsArray.length
  }

  if (useFavoriteModels) {
    const favModels = AppSettings.get('favoriteModels') || {}
    const favModelCount =
      Object.keys(favModels).length > 0 ? Object.keys(favModels).length : 1
    imageCount = imageCount * favModelCount
  }

  if (useAllSamplers) {
    let samplerCount = DEFAULT_SAMPLER_ARRAY.length

    if (
      models[0] === 'stable_diffusion_2.0' ||
      models[0] === 'stable_diffusion_2.1'
    ) {
      samplerCount = 1
    }

    imageCount = imageCount * samplerCount
  }

  return imageCount
}

export const dataUrlToFile = (
  dataUrl: string,
  filename: string
): File | undefined => {
  dataUrl = `data:image/webp;base64,` + dataUrl
  const arr = dataUrl.split(',')
  if (arr.length < 2) {
    return undefined
  }
  const mimeArr = arr[0].match(/:(.*?);/)
  if (!mimeArr || mimeArr.length < 2) {
    return undefined
  }
  const mime = mimeArr[1]
  const buff = Buffer.from(arr[1], 'base64')
  return new File([buff], filename, { type: mime })
}

export const generateBase64Thumbnail = async (
  base64: string,
  jobId: string,
  maxWidth: number = 320,
  maxHeight: number = 768,
  quality: number = 0.9
) => {
  let fullDataString: any
  let file: any

  try {
    file = dataUrlToFile(base64, `${jobId}.webp`)
  } catch (err) {
    console.log(`dataUrlToFile`, dataUrlToFile)
    return
  }

  const { readAndCompressImage } = await import('browser-image-resizer')

  let resizedImage: any
  try {
    resizedImage = await readAndCompressImage(file, {
      maxHeight,
      maxWidth,
      quality
    })
  } catch (err) {
    console.log(`readAndCompressImage`, err)
    return
  }

  if (resizedImage) {
    fullDataString = await getBase64(resizedImage)
  }

  if (!fullDataString) {
    return
  }

  const [, imgBase64String] = fullDataString.split(';base64,')
  return imgBase64String
}

export const inferMimeTypeFromBase64 = (base64: string) => {
  if (base64.indexOf('data:') === 0) {
    let [data] = base64?.split(',') || ['']
    data = data.replace('data:', '')
    data = data.replace(';base64', '')
    return data
  }

  // Convert base64 string to array of integers
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  // Check the bytes to identify the format
  if (byteArray[0] === 0xff && byteArray[1] === 0xd8 && byteArray[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    byteArray[0] === 0x89 &&
    byteArray[1] === 0x50 &&
    byteArray[2] === 0x4e &&
    byteArray[3] === 0x47
  ) {
    return 'image/png'
  }
  if (byteArray[0] === 0x47 && byteArray[1] === 0x49 && byteArray[2] === 0x46) {
    return 'image/gif'
  }
  if (byteArray[0] === 0x42 && byteArray[1] === 0x4d) {
    return 'image/bmp'
  }
  if (
    byteArray[0] === 0x38 &&
    byteArray[1] === 0x42 &&
    byteArray[2] === 0x50 &&
    byteArray[3] === 0x53
  ) {
    return 'image/psd'
  }
  if (
    byteArray[0] === 0x52 &&
    byteArray[1] === 0x49 &&
    byteArray[2] === 0x46 &&
    byteArray[3] === 0x46 &&
    byteArray[8] === 0x57 &&
    byteArray[9] === 0x45 &&
    byteArray[10] === 0x42 &&
    byteArray[11] === 0x50
  ) {
    return 'image/webp'
  }

  return 'unknown'
}

export const isBase64UrlImage = async (base64String: string) => {
  let image = new Image()
  image.src = base64String
  return await new Promise((resolve) => {
    image.onload = function () {
      if (image.height === 0 || image.width === 0) {
        resolve(false)
        return
      }
      resolve(true)
    }
    image.onerror = () => {
      resolve(false)
    }
  })
}

export const cleanDataForApiRequestDisplay = (imageDetails: any) => {
  // @ts-ignore
  const params = new ImageParamsForApi(imageDetails)

  // @ts-ignore

  if (params.source_image) {
    // @ts-ignore
    params.source_image = '[true]'
  }

  // @ts-ignore
  if (params.source_mask) {
    // @ts-ignore
    params.source_mask = '[true]'
  }

  // @ts-ignore
  delete params.nsfw
  // @ts-ignore
  delete params.censor_nsfw
  // @ts-ignore
  delete params.trusted_workers
  // @ts-ignore
  delete params.shared
  // @ts-ignore
  delete params.slow_workers
  // @ts-ignore
  delete params.r2
  // @ts-ignore
  delete params.dry_run

  /*** Remove these as they are the default options ***/
  // @ts-ignore
  if (params.params.post_processing.length === 0) {
    // @ts-ignore
    delete params.params.post_processing
  }

  // @ts-ignore
  if (params.params.clip_skip === 1) {
    // @ts-ignore
    delete params.params.clip_skip
  }

  // @ts-ignore
  if (params.params.n === 1) {
    // @ts-ignore
    delete params.params.n
  }

  // @ts-ignore
  if (!params.params.tiling) {
    // @ts-ignore
    delete params.params.tiling
  }

  // @ts-ignore
  if (params.replacement_filter) {
    // @ts-ignore
    delete params.replacement_filter
  }

  // @ts-ignore
  if (!params.params.return_control_map) {
    // @ts-ignore
    delete params.params.return_control_map
  }

  // @ts-ignore
  if (!params.params.image_is_control) {
    // @ts-ignore
    delete params.params.image_is_control
  }

  console.log(params)

  return params
}
