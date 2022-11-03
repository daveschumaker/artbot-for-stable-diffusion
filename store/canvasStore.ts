// Cache data related to FabricJS / canvas

interface ICanvas {
  cached: boolean
  canvasRef: any
  imageLayerRef: any
  drawLayerRef: any
  visibleCanvas: any
  height: any
  width: any
}

let i2iCanvas: ICanvas = {
  cached: false,
  canvasRef: null,
  imageLayerRef: null,
  drawLayerRef: null,
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

interface IBase64String {
  base64String: string
  height: number
  width: number
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
export const cloneFromImage = (
  canvasObj: ICanvas,
  imageDetails: IBase64String
) => {
  i2iCanvas = canvasObj
  i2iBase64String = imageDetails
}

export const clearCanvasStore = () => {
  i2iCanvas = {
    cached: false,
    canvasRef: null,
    imageLayerRef: null,
    drawLayerRef: null,
    visibleCanvas: null
  }

  i2iBase64String = {
    base64String: '',
    height: 0,
    width: 0
  }
}
