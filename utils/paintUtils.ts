// store details of last painted image for quick reloading
let sessionPaintCache: string = ''

export const setSessionPaintCache = (base64String: string) => {
  sessionPaintCache = base64String
}

export const getSessionPaintCache = () => {
  return sessionPaintCache
}

// store image details for sending any existing image
// within browser db to painter
const paintImage = {
  imageType: '',
  base64String: '',
  height: 512,
  width: 512
}

interface IImagePaint {
  imageType: string
  base64String: string
  height: number
  width: number
}

export const setImageForPaint = ({
  imageType,
  base64String,
  height,
  width
}: IImagePaint) => {
  paintImage.imageType = imageType
  paintImage.base64String = base64String
  paintImage.height = height
  paintImage.width = width
}

export const getImageForPaint = () => {
  return Object.assign({}, paintImage)
}

export const clearImageForPaint = () => {
  paintImage.imageType = ''
  paintImage.base64String = ''
}
