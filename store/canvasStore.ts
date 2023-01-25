// Cache data related to FabricJS / canvas

import { IBase64String, ICanvas } from '../types'

let i2iCanvas: ICanvas = {
  cached: false,
  canvasRef: null,
  drawLayer: null,
  maskLayer: null,
  visibleCanvas: null,
  height: null,
  width: null
}

export const getCanvasStore = () => {
  return i2iCanvas
}

export const storeCanvas = (canvasType: string, data: any) => {
  i2iCanvas[canvasType as keyof ICanvas] = data
  i2iCanvas.cached = true
}

let i2iBase64String: IBase64String = {
  base64String: '',
  height: 0,
  width: 0
}

export const setI2iUploaded = (data: IBase64String) => {
  i2iBase64String.base64String = data.base64String
  i2iBase64String.height = data.height
  i2iBase64String.width = data.width
}

export const getI2IString = () => {
  return i2iBase64String
}

// Restore canvas image + mask data from image
export const cloneFromImage = (canvasObj: ICanvas) => {
  i2iCanvas = canvasObj
}

export const clearCanvasStore = () => {
  i2iCanvas = {
    cached: false,
    canvasRef: null,
    drawLayer: null,
    maskLayer: null,
    visibleCanvas: null,
    height: null,
    width: null
  }

  i2iBase64String = {
    base64String: '',
    height: 0,
    width: 0
  }
}
