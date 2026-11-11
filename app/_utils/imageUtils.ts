import { createImage } from 'app/_api/createImage'
import { trackEvent } from 'app/_api/telemetry'
import { userInfoStore } from 'app/_store/userStore'
import { initBlob } from './blobUtils'
import { showErrorToast } from './notificationUtils'
import { SourceProcessing } from './promptUtils'
import { isValidHttpUrl } from './validationUtils'
import { hasPromptMatrix, promptMatrix } from './promptUtils'
import AppSettings from 'app/_data-models/AppSettings'
import { DEFAULT_SAMPLER_ARRAY } from '_constants'
import { isiOS, isSafariBrowser } from './appUtils'
import { fetchCompletedJobs } from './db'
import { basePath } from 'BASE_PATH'
import ImageParamsForApi, {
  IApiParams,
  IArtBotImageDetails
} from 'app/_data-models/ImageParamsForApi'
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
      console.log(`image w x h:`, image.width, image.height)

      // Resolve the promise with an object containing the width and height
      resolve({ width: image.width, height: image.height })
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
    // CreateImageJob.numImages is optional, IArtBotImageDetails.numImages is
    // required but never read by createImage.
    const data = await createImage(clonedParams as IArtBotImageDetails)
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
  // readAsDataURL always produces a string result.
  return new Promise<string>((resolve) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      return resolve(reader.result as string)
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

// Resolves to null if the data can't be read as an image.
export const base64toBlob = async (
  base64Data: string
): Promise<Blob | null> => {
  try {
    const base64str = `data:${inferMimeTypeFromBase64(
      base64Data
    )};base64,${base64Data}`
    const base64Response = await fetch(base64str)
    const blob = await base64Response.blob()

    return blob
  } catch (err) {
    return null
  }
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

export const blobToClipboard = async (base64String: string) => {
  initBlob()

  const toPNG = async () => {
    const image = await base64toBlob(base64String)

    if (!image) {
      throw new Error('Unable to read the image')
    }

    return await image.toPNG()
  }

  if (isiOS() || isSafariBrowser()) {
    // Safari needs the clipboard write to start straight away, so it gets a
    // promise of the image rather than the image.
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': toPNG()
        })
      ])

      return true
    } catch (err) {
      return false
    }
  } else {
    try {
      // Only PNGs can be copied to the clipboard
      const newBlob = await toPNG()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': newBlob })
      ])
      return true
    } catch (err) {
      return false
    }
  }
}

const DOWNLOAD_FORMATS = {
  jpg: { mimeType: 'image/jpeg', convert: (blob: Blob) => blob.toJPEG() },
  png: { mimeType: 'image/png', convert: (blob: Blob) => blob.toPNG() },
  webp: { mimeType: 'image/webp', convert: (blob: Blob) => blob.toWebP() }
}

type DownloadFormat = keyof typeof DOWNLOAD_FORMATS

// Anything other than the formats in settings falls back to the default.
const getDownloadFormat = (): DownloadFormat => {
  const saved = AppSettings.get('imageDownloadFormat')
  return saved in DOWNLOAD_FORMATS ? saved : 'jpg'
}

// Resolves to null if the image can't be read or converted.
const toDownloadBlob = async (
  base64String: string,
  format: DownloadFormat
): Promise<Blob | null> => {
  const input = await base64toBlob(base64String)

  if (!input) {
    return null
  }

  // Always go through the converter, even when the image is already in this
  // format: it also repairs prompts that earlier versions encoded twice.
  // Blobs from base64toBlob are typed by their content, so this is reliable.
  const sameFormat = input.type === DOWNLOAD_FORMATS[format].mimeType

  try {
    return await DOWNLOAD_FORMATS[format].convert(input)
  } catch (err) {
    console.log(`Error converting image to ${format}`, err)
    // The stored image is still a valid download, just without the repair.
    return sameFormat ? input : null
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

    const fileType = getDownloadFormat()
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

    const imageData: {
      name: string
      date: Date
      prompt: string
      negative_prompt: string
      sampler: string
      model: string
      loras: unknown
      height: number
      width: number
      steps: number
      cfg_scale: number
      seed: string
      denoising_strength?: number
    } = {
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
      imageData.denoising_strength = image.denoising_strength
    }

    const newBlob = await toDownloadBlob(image.base64String, fileType)

    if (!newBlob) {
      console.log(`Error: unable to export image ${image.jobId}`)
      continue
    }

    fileDetails.push(imageData)
    fileArray.push({
      name: filename,
      lastModified: new Date(image.timestamp),
      input: newBlob
    })

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

// Resolves to false, after telling the user, if the image can't be downloaded.
export const downloadFile = async (image: any) => {
  initBlob()
  const fileType = getDownloadFormat()
  const blob = await toDownloadBlob(image.base64String, fileType)

  if (!blob) {
    showErrorToast({ message: 'Unable to download this image.' })
    return false
  }

  const { saveAs } = (await import('file-saver')).default
  const filename =
    image.prompt
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .slice(0, 124) + `.${fileType}`

  saveAs(blob, filename)
  return true
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
      if (!isNaN(Number(split)) && split) {
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
      if (!isNaN(Number(split)) && split) {
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
      if (!isNaN(Number(split)) && split) {
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
      if (!isNaN(Number(split)) && split) {
        splitCount++
      }
    })

    if (splitCount > 0) {
      imageCount = imageCount * splitCount
    }
  }

  if (hasPromptMatrix(prompt) || hasPromptMatrix(negative)) {
    const matrixPrompts = [...promptMatrix(prompt)]
    const matrixNegative = [...promptMatrix(negative)]

    const promptLength = matrixPrompts.length > 0 ? matrixPrompts.length : 1
    const negLength = matrixNegative.length > 0 ? matrixNegative.length : 1

    imageCount = imageCount * (promptLength * negLength)
  }

  if (models.length > 1) {
    imageCount = imageCount * models.length
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

const dataUrlToFile = (dataUrl: string, filename: string): File | undefined => {
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
  // The ImageParamsForApi constructor returns an IApiParams object. Fields are
  // deleted below for display, so treat everything as optional.
  const params: Partial<Omit<IApiParams, 'params'>> & {
    params: Partial<IApiParams['params']>
  } = new ImageParamsForApi(imageDetails) as unknown as IApiParams

  if (params.source_image) {
    params.source_image = '[true]'
  }

  if (params.source_mask) {
    params.source_mask = '[true]'
  }

  delete params.nsfw
  delete params.censor_nsfw
  delete params.trusted_workers
  delete params.shared
  delete params.slow_workers
  delete params.r2
  delete params.dry_run

  /*** Remove these as they are the default options ***/
  if (params.params.post_processing?.length === 0) {
    delete params.params.post_processing
  }

  if (params.params.clip_skip === 1) {
    delete params.params.clip_skip
  }

  if (params.params.n === 1) {
    delete params.params.n
  }

  if (!params.params.tiling) {
    delete params.params.tiling
  }

  if (params.replacement_filter) {
    delete params.replacement_filter
  }

  if (!params.params.return_control_map) {
    delete params.params.return_control_map
  }

  if (!params.params.image_is_control) {
    delete params.params.image_is_control
  }

  console.log(params)

  return params
}
