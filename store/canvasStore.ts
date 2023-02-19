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

// Restore canvas image + mask data from image
export const cloneFromImage = (canvasObj: ICanvas) => {
  clonedCanvasObj = canvasObj
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

  clonedCanvasObj = null
}

//// SIMPLE SAVE STATE SOLUTION
interface ISavedHistory {
  undo: Array<any>
  redo: Array<any>
}

let savedDrawingState: any = null
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
} => {
  if (savedDrawingState === null || !savedDrawingState) {
    // @ts-ignore
    return false
  }

  return {
    savedDrawingState,
    canvasHeight,
    canvasWidth
  }
}

export const getSavedHistoryState = () => {
  return {
    undo: [...savedHistory.undo],
    redo: [...savedHistory.redo]
  }
}

export const saveDrawingState = (data: any, height = 512, width = 512) => {
  savedDrawingState = data
  canvasHeight = height
  canvasWidth = width
}

export const saveHistoryState = ({ undo, redo }: { undo: any; redo: any }) => {
  savedHistory.undo = [...undo]
  savedHistory.redo = [...redo]
}

export const resetSavedDrawingState = () => {
  savedDrawingState = null
  savedHistory = {
    undo: [],
    redo: []
  }
}
