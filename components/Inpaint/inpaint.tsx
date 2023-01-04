import { useRef, useState } from 'react'
import { fabric } from 'fabric'
import styled from 'styled-components'
import 'fabric-history'

import { debounce } from '../../utils/debounce'
import { getBase64, nearestWholeMultiple } from '../../utils/imageUtils'
import { Button } from '../UI/Button'
import BrushIcon from '../icons/BrushIcon'
import EraserIcon from '../icons/EraserIcon'
import UndoIcon from '../icons/UndoIcon'
import RedoIcon from '../icons/RedoIcon'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import {
  getCanvasStore,
  getI2IString,
  storeCanvas
} from '../../store/canvasStore'
import { getCanvasHeight, getPanelWidth } from '../../utils/fabricUtils'

interface IHistory {
  path: fabric.Path
  drawPath?: fabric.Path
  visibleDrawPath?: fabric.Path
}

let redoHistory: Array<IHistory> = []
let undoHistory: Array<IHistory> = []

interface CanvasProps {
  ref: any
}

interface LayerParams {
  absolute?: boolean
  fill?: string
  image?: fabric.Image
  layerHeight?: number
  layerWidth?: number
  opacity?: number
}

const StyledCanvas = styled.canvas<CanvasProps>`
  border: 1px solid ${(props) => props.theme.border};
`

interface Props {
  handleRemoveClick: any
  setInput: any
}

const Inpaint = ({ handleRemoveClick, setInput }: Props) => {
  const [, setDrawMode] = useState<string>('paint')

  const brushRef = useRef<any>(null)
  const drawModeRef = useRef<string>('paint')

  const brushPreviewRef = useRef<fabric.Circle | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)

  const canvasRef = useRef<fabric.Canvas | null>(null)
  const drawLayerRef = useRef<any | null>(null)
  const imageLayerRef = useRef<any | null>(null)
  const visibleDrawLayerRef = useRef<any | null>(null)

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

  interface IFileSelect {
    file: any
    skipRead: boolean
    skipSetup: boolean
  }

  const handleFileSelect = async ({
    file,
    skipRead = false,
    skipSetup = false
  }: IFileSelect) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!file) {
      return
    }

    if (!canvasRef.current) {
      return
    }

    let resizedImage
    let fullDataString: string = ''

    if (!skipRead) {
      const { readAndCompressImage } = await import('browser-image-resizer')
      resizedImage = await readAndCompressImage(file, {
        quality: 0.9,
        maxWidth: 1024,
        maxHeight: 1024
      })

      if (file) {
        // @ts-ignore
        fullDataString = await getBase64(resizedImage)
        storeCanvas('imageLayerRef', fullDataString)
      }
    } else {
      fullDataString = file
    }

    if (!fullDataString) {
      return
    }

    fabric.Image.fromURL(fullDataString, function (image) {
      if (!canvasRef.current || !image) {
        return
      }

      resetCanvas()

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

      storeCanvas('height', newHeight)
      storeCanvas('width', newWidth)

      // Init canvas settings
      canvasRef.current.isDrawingMode = true
      canvasRef.current.setHeight(newHeight)
      canvasRef.current.setWidth(newWidth)

      // Generate various layers
      imageLayerRef.current = makeNewLayer({
        image,
        layerHeight: newHeight,
        layerWidth: newWidth
      })

      if (!skipSetup) {
        drawLayerRef.current = makeInvisibleDrawLayer(newHeight, newWidth)

        visibleDrawLayerRef.current = makeNewLayer({
          layerHeight: newHeight,
          layerWidth: newWidth
        })
        visibleDrawLayerRef.current.set('opacity', 0.8)

        // Add to Canvas
        canvasRef?.current?.add(imageLayerRef.current)
        canvasRef?.current?.add(visibleDrawLayerRef.current)
      }

      if (brushPreviewRef.current) {
        canvasRef?.current?.add(brushPreviewRef.current)
      }
    })
  }

  // const downloadWebp = (base64Data: string, fileName = 'test') => {
  //   const linkSource = `${base64Data}`
  //   const downloadLink = document.createElement('a')
  //   downloadLink.href = linkSource
  //   downloadLink.download = fileName.substring(0, 255) + '.webp' // Only get first 255 characters so we don't break the max file name limit
  //   downloadLink.click()
  // }

  ///////////////////////

  const initCanvas = ({ height = 512, width = 768 } = {}) => {
    const innerWidth = window.innerWidth
    const containerWidth = getPanelWidth(innerWidth)
    const newHeight = getCanvasHeight({ foundWidth: containerWidth })

    canvasRef.current = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: 'white',
      isDrawingMode: false,
      height,
      width
    })

    canvasRef.current.freeDrawingCursor = 'crosshair'
    canvasRef.current.selection = false
    canvasRef.current.setHeight(newHeight)
    canvasRef.current.setWidth(containerWidth)
    makeBrushPreviewLayer()
    setBrush('white')

    canvasRef.current.on('mouse:move', onMouseMove)
    canvasRef.current.on('path:created', onPathCreated)
    canvasRef.current.renderAll()
  }

  const makeBrushPreviewLayer = () => {
    brushPreviewRef.current = new fabric.Circle({
      radius: 20,
      left: 0,
      originX: 'center',
      originY: 'center',
      angle: 0,
      fill: '',
      stroke: 'red',
      strokeWidth: 3,
      opacity: 0
    })
  }

  const makeInvisibleDrawLayer = (height = 512, width = 768) => {
    const newDrawLayer = new fabric.Canvas(null)

    newDrawLayer.backgroundColor = 'black'
    newDrawLayer.selection = false
    newDrawLayer.setHeight(height)
    newDrawLayer.setWidth(width)

    return newDrawLayer
  }

  const makeNewLayer = ({
    absolute = true,
    fill = 'transparent',
    image,
    layerHeight = 512,
    layerWidth = 768,
    opacity = 1
  }: LayerParams = {}) => {
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

  const debounceBrushPreview = debounce(() => {
    if (!brushPreviewRef.current || !canvasRef.current) {
      return
    }

    brushPreviewRef.current.opacity = 0
    try {
      canvasRef?.current?.renderAll()
    } catch (err) {
      console.log(`An oopsie happened!`)
    }
  }, 500)

  const onMouseMove = (event: fabric.IEvent<Event>) => {
    if (!canvasRef.current || !brushPreviewRef.current) {
      return
    }

    const pointer = canvasRef.current.getPointer(event.e)
    brushPreviewRef.current.left = pointer.x
    brushPreviewRef.current.top = pointer.y
    brushPreviewRef.current.opacity = 0.5

    if (drawModeRef.current === 'erase') {
      brushPreviewRef.current.set('strokeWidth', 3)
      brushPreviewRef.current.set('fill', 'red')
      setBrush('red')
    } else {
      brushPreviewRef.current.set('strokeWidth', 0)
      brushPreviewRef.current.set('fill', 'white')
      setBrush('white')
    }

    brushPreviewRef.current.set('radius', 20 / 2)
    debounceBrushPreview()
    canvasRef.current.renderAll()
  }

  const onPathCreated = async (e: any) => {
    const path = { path: e.path }
    await pathCreate(path)
    redoHistory.push(path)

    if (canvasRef.current) {
      let baseCanvas = canvasRef.current.toObject()
      storeCanvas('canvasRef', baseCanvas)

      let drawCanvas = drawLayerRef.current.toObject()
      storeCanvas('drawLayerRef', drawCanvas)

      autoSave()
    }
  }

  const pathCreate = async (newPath: any, eraseOverride = false) => {
    if (
      !canvasRef.current ||
      !drawLayerRef.current ||
      !visibleDrawLayerRef.current
    ) {
      return
    }

    newPath.path.selectable = false
    newPath.path.opacity = 1

    newPath.drawPath = (await asyncClone(newPath.path)) as fabric.Path
    newPath.visibleDrawPath = (await asyncClone(newPath.path)) as fabric.Path

    if (!eraseOverride && drawModeRef.current === 'erase') {
      newPath.visibleDrawPath.globalCompositeOperation = 'destination-out'
      newPath.drawPath.stroke = 'black'
    } else {
      newPath.visibleDrawPath.globalCompositeOperation = 'source-over'
    }
    drawLayerRef.current.add(newPath.drawPath)
    visibleDrawLayerRef.current.addWithUpdate(newPath.visibleDrawPath)
    canvasRef.current.remove(newPath.path)
    canvasRef.current.renderAll()
  }

  const resetCanvas = () => {
    if (!canvasRef.current) {
      return
    }

    if (imageLayerRef.current) {
      canvasRef?.current?.remove(imageLayerRef.current)
      imageLayerRef.current = undefined
    }
    if (drawLayerRef.current) {
      drawLayerRef.current = undefined
    }
    if (visibleDrawLayerRef.current) {
      canvasRef?.current?.remove(visibleDrawLayerRef.current)
      visibleDrawLayerRef.current = undefined
    }
    canvasRef.current.isDrawingMode = false
  }

  // const saveImageMask = () => {
  //   const data = {
  //     image: '',
  //     mask: ''
  //   }

  //   if (imageLayerRef.current) {
  //     data.image = imageLayerRef.current
  //       .toDataURL({ format: 'webp' })
  //       .split(',')[1]
  //   }

  //   if (drawLayerRef.current) {
  //     data.mask = drawLayerRef.current
  //       .toDataURL({ format: 'webp' })
  //       .split(',')[1]
  //   }

  //   downloadWebp(drawLayerRef.current.toDataURL({ format: 'webp' }), 'mask')
  //   downloadWebp(imageLayerRef.current.toDataURL({ format: 'webp' }), 'image')

  //   return data
  // }

  const setBrush = (color?: string) => {
    if (!canvasRef.current) {
      return
    }

    brushRef.current = canvasRef.current.freeDrawingBrush
    brushRef.current.color = color || brushRef?.current?.color
    brushRef.current.width = 20
  }

  const redo = () => {
    if (undoHistory.length === 0) {
      return
    }

    const path = undoHistory.pop() as IHistory
    pathCreate(path, true)
    redoHistory.push(path)
  }

  const undo = () => {
    if (
      redoHistory.length === 0 ||
      !drawLayerRef.current ||
      !visibleDrawLayerRef.current ||
      !canvasRef.current
    ) {
      return
    }

    const path = redoHistory.pop() as IHistory
    undoHistory.push(path)
    drawLayerRef.current.remove(path.drawPath as fabric.Path)
    visibleDrawLayerRef.current.remove(path.visibleDrawPath as fabric.Path)
    delete path.drawPath
    delete path.visibleDrawPath

    // saveImages()
    // updateCanvas()
  }

  /////////////

  const handleEraseClick = () => {
    setDrawMode('erase')
    drawModeRef.current = 'erase'
    setBrush('red')
  }

  const handlePaintClick = () => {
    setDrawMode('paint')
    drawModeRef.current = 'paint'
    setBrush('white')
  }

  const autoSave = () => {
    if (!canvasRef.current) {
      return
    }

    const data = {
      image: '',
      mask: ''
    }

    if (imageLayerRef.current) {
      data.image = imageLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    if (drawLayerRef.current) {
      data.mask = drawLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    setInput({
      imageType: 'image/webp',
      source_image: data.image,
      source_mask: data.mask,
      source_processing: 'inpainting',
      orientation: 'custom',
      height: nearestWholeMultiple(canvasRef.current.height || 512),
      width: nearestWholeMultiple(canvasRef.current.width || 512)
    })
  }

  useEffectOnce(() => {
    redoHistory = []
    undoHistory = []

    if (!getCanvasStore().canvasRef && getI2IString().base64String) {
      const innerWidth = window.innerWidth
      const containerWidth = getPanelWidth(innerWidth)
      let newHeight = getI2IString().height
      let newWidth = getI2IString().width

      if (newWidth > containerWidth) {
        newHeight = getCanvasHeight({
          baseHeight: getI2IString().height,
          baseWidth: getI2IString().width,
          foundWidth: containerWidth
        })
        newWidth = containerWidth
      }

      initCanvas({ height: newHeight, width: newWidth })

      setTimeout(() => {
        handleFileSelect({
          file: getI2IString().base64String,
          skipRead: true,
          skipSetup: false
        })

        if (canvasRef.current) {
          // canvasRef.current.backgroundColor = 'white'
          // canvasRef.current.setHeight(newHeight)
          // canvasRef.current.setWidth(newWidth)
          // canvasRef.current.renderAll()
        }
      }, 250)
    } else if (getCanvasStore().canvasRef) {
      const { height, width } = getCanvasStore()
      initCanvas({ height, width })

      if (!canvasRef.current) {
        return
      }

      canvasRef.current.clear()
      canvasRef.current.loadFromJSON(getCanvasStore().canvasRef, () => {
        if (!canvasRef.current) {
          return
        }

        const objects = canvasRef?.current?.getObjects()

        imageLayerRef.current = objects[0]
        visibleDrawLayerRef.current = objects[1]
        // @ts-ignore
        brushPreviewRef.current = objects[2]

        visibleDrawLayerRef.current.set('opacity', 0.8)
        visibleDrawLayerRef.current.set('selectable', false)

        drawLayerRef.current = new fabric.Canvas(null)
        drawLayerRef.current.setHeight(height)
        drawLayerRef.current.setWidth(width)
        drawLayerRef.current.loadFromJSON(getCanvasStore().drawLayerRef)

        canvasRef.current.isDrawingMode = true
      })

      setTimeout(function () {
        if (!canvasRef.current) {
          return
        }

        canvasRef.current.setHeight(height)
        canvasRef.current.setWidth(width)
        canvasRef.current.renderAll()
      }, 50)
    } else {
      initCanvas()
    }

    return () => {
      canvasRef?.current?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <div className="relative mx-auto">
      <div className="flex flex-row gap-2 mb-2">
        <div className="flex flex-row gap-2 mb-2 shrink-0">
          <Button
            //@ts-ignore
            onClick={() => {
              undo()
            }}
          >
            <UndoIcon />
          </Button>
          <Button
            //@ts-ignore
            onClick={() => {
              redo()
            }}
          >
            <RedoIcon />
          </Button>
          <Button onClick={handlePaintClick}>
            <BrushIcon />
          </Button>
          <Button onClick={handleEraseClick}>
            <EraserIcon />
          </Button>
        </div>
        <div className="flex flex-row gap-2 mb-2 justify-end grow">
          <Button btnType="secondary" onClick={handleRemoveClick}>
            Remove image
          </Button>
        </div>
        {/* <Button onClick={saveImageMask}>
          <DownloadIcon />
        </Button> */}
      </div>
      <StyledCanvas id="canvas" ref={canvasElementRef} />
    </div>
  )
}

export default Inpaint
