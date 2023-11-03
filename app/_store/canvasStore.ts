// Cache data related to FabricJS / canvas

import { IBase64String, ICanvas } from '_types'

let i2iCanvas: ICanvas = {
  cached: false,
  canvasRef: null,
  drawLayer: null,
  maskLayer: null,
  visibleCanvas: null,
  height: null,
  width: null
}

let clonedCanvasObj: any = null

export const getCanvasStore = () => {
  return { ...i2iCanvas, clonedCanvasObj }
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

export const clearI2IString = () => {
  i2iBase64String = {
    base64String: '',
    height: 0,
    width: 0
  }
}

// Restore canvas image + mask data from image
export const cloneFromImage = (canvasObj: ICanvas) => {
  clonedCanvasObj = canvasObj
}

//// SIMPLE SAVE STATE SOLUTION
interface ISavedHistory {
  undo: Array<any>
  redo: Array<any>
}

let savedDrawingState: any = null
let savedDrawingBaseImage: any = false
let canvasHeight = 512
let canvasWidth = 512

let savedHistory: ISavedHistory = {
  undo: [],
  redo: []
}

export const getSavedDrawingState = (): {
  savedDrawingState: any
  canvasHeight: number
  canvasWidth: number
  savedDrawingBaseImage?: any
} => {
  if (savedDrawingState === null || !savedDrawingState) {
    // @ts-ignore
    return false
  }

  return {
    savedDrawingState,
    canvasHeight,
    canvasWidth,
    savedDrawingBaseImage
  }
}

export const getSavedHistoryState = () => {
  return {
    undo: [...savedHistory.undo],
    redo: [...savedHistory.redo]
  }
}

export const saveDrawingState = (
  data: any,
  height = 512,
  width = 512,
  baseImage: any
) => {
  savedDrawingState = data
  canvasHeight = height
  canvasWidth = width
  savedDrawingBaseImage = baseImage
}

export const saveHistoryState = ({ undo, redo }: { undo: any; redo: any }) => {
  savedHistory.undo = [...undo]
  savedHistory.redo = [...redo]
}

export const resetSavedDrawingState = () => {
  savedDrawingState = null
  savedDrawingBaseImage = null
  savedHistory = {
    undo: [],
    redo: []
  }
}

// ANOTHER HACKY THING. SAVE BASE64
let base64FromDraw: string | null = null
let drawHeight: number | null = null
let drawWidth: number | null = null

interface IDrawParams {
  base64: string
  height: number
  width: number
}

export const setBase64FromDraw = ({ base64, height, width }: IDrawParams) => {
  base64FromDraw = base64
  drawHeight = height
  drawWidth = width
}

export const getBase64FromDraw = (): IDrawParams => {
  if (base64FromDraw === null || drawHeight === null || drawWidth === null) {
    return {
      base64: '',
      height: 512,
      width: 512
    }
  }

  return {
    base64: base64FromDraw,
    height: drawHeight,
    width: drawWidth
  }
}

export const clearBase64FromDraw = () => {
  base64FromDraw = null
  drawHeight = null
  drawWidth = null
}
