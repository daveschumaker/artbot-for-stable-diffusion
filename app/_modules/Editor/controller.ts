import { fabric } from 'fabric'

import { getCanvasHeight, getPanelWidth } from 'app/_utils/fabricUtils'
import { getI2IString } from 'app/_store/canvasStore'

let canvas: any
let drawLayer: any
let maskLayer: any

const updateCanvas = () => {
  if (!canvas) {
    return
  }

  canvas.renderAll()
}

const asyncClone = async (object: any) => {
  return new Promise(function (resolve, reject) {
    try {
      object.clone(function (cloned_object: any) {
        resolve(cloned_object)
      })
    } catch (error) {
      reject(error)
    }
  })
}

const clonePath = async (path: any) => {
  if (!canvas || !drawLayer || !maskLayer) {
    return
  }

  const pathColor = 'white'

  path.path.selectable = false
  path.path.opacity = 0.3

  path.maskPath = (await asyncClone(path.path)) as fabric.Path
  path.drawPath = (await asyncClone(path.path)) as fabric.Path

  path.maskPath.stroke = pathColor
  path.drawPath.globalCompositeOperation = 'source-over'

  maskLayer.add(path.maskPath)
  drawLayer.addWithUpdate(path.drawPath)

  canvas.remove(path.path)
  updateCanvas()
}

const onPathCreated = async (e: any) => {
  const path = { path: e.path }
  await clonePath(path)
}

export const makeNewLayer = ({
  absolute = true,
  fill = 'transparent',
  image,
  layerHeight = 512,
  layerWidth = 768,
  opacity = 1
}: any) => {
  const newLayer =
    image ||
    new fabric.Rect({
      width: layerWidth,
      height: layerHeight,
      left: 0,
      top: 0,
      fill: fill,
      absolutePositioned: absolute,
      selectable: false
    })

  const newGroup = new fabric.Group([newLayer], {
    selectable: false,
    absolutePositioned: absolute,
    opacity
  })

  return newGroup
}

export const importImage = () => {
  if (!canvas) {
    return {
      height: 0,
      width: 0
    }
  }

  let height
  let width

  const fullDataString = getI2IString().base64String

  fabric.Image.fromURL(fullDataString, function (image) {
    const innerWidth = window.innerWidth
    const containerWidth = getPanelWidth(innerWidth)
    let newHeight = image.height || 512
    let newWidth = containerWidth

    // @ts-ignore
    if (image?.width > containerWidth && image.width >= image.height) {
      newHeight = getCanvasHeight({
        baseHeight: image.height,
        baseWidth: image.width,
        foundWidth: containerWidth
      })

      image.scaleToWidth(containerWidth)

      // @ts-ignore
    } else if (image.height > image.width && image.width > containerWidth) {
      newHeight = getCanvasHeight({
        baseHeight: image.height,
        baseWidth: image.width,
        foundWidth: containerWidth
      })

      image.scaleToWidth(containerWidth)
    } else if (image.height === image.width) {
      newHeight = image.height || 512
      newWidth = image.width || 512
    } else if (image.width && image.width < containerWidth) {
      newWidth = image.width
    }

    canvas.setHeight(newHeight)
    canvas.setWidth(newWidth)

    const imageLayer = makeNewLayer({
      image,
      layerHeight: newHeight,
      layerWidth: newWidth
    })

    height = newHeight
    width = newWidth

    canvas.add(imageLayer)
  })

  return {
    height,
    width
  }
}

export const createDrawLayer = ({
  height,
  width,
  opacity = 1.0
}: {
  height: number
  width: number
  opacity: number
}) => {
  const drawLayer = makeNewLayer({
    layerHeight: height,
    layerWidth: width,
    opacity
  })

  return drawLayer
}

export const updateBrush = () => {
  if (!canvas) {
    return
  }

  canvas.freeDrawingCursor = 'crosshair'
  const brush = canvas.freeDrawingBrush
  brush.color = 'white'
  brush.width = 20
}

export const createMaskLayer = ({
  height,
  width
}: {
  height: number
  width: number
}) => {
  const newCanvas = new fabric.Canvas(null)

  newCanvas.backgroundColor = 'black'
  newCanvas.selection = false
  newCanvas.setHeight(height)
  newCanvas.setWidth(width)

  return newCanvas
}

export const initInpaint = (newCanvas: fabric.Canvas | undefined) => {
  if (!newCanvas) {
    return
  }

  canvas = newCanvas

  const { height, width } = importImage()

  //@ts-ignore
  maskLayer = createMaskLayer({ height, width })

  drawLayer = createDrawLayer({
    //@ts-ignore
    height,
    //@ts-ignore
    width,
    opacity: 0.8
  })

  canvas.add(drawLayer)
  canvas.isDrawingMode = true

  updateBrush()

  canvas.on('path:created', onPathCreated)
  updateCanvas()

  return {
    drawLayer,
    maskLayer
  }
}
