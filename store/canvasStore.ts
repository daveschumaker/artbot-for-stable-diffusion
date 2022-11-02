// Cache data related to FabricJS / canvas

interface ICanvas {
  cached: boolean
  canvasRef: any
  imageLayerRef: any
  drawLayerRef: any
  visibleCanvas: any
}

const i2iCanvas: ICanvas = {
  cached: false,
  canvasRef: null,
  imageLayerRef: null,
  drawLayerRef: null,
  visibleCanvas: null
}

export const getCanvasStore = () => {
  return i2iCanvas
}

export const storeCanvas = (canvasType: string, data: any) => {
  console.log(`Storing canvas for:`, canvasType)
  i2iCanvas[canvasType as keyof ICanvas] = data
  i2iCanvas.cached = true
}
