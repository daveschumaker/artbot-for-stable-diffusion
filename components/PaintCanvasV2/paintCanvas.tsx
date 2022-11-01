import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { fabric } from 'fabric'
import styled from 'styled-components'
import 'fabric-history'

import { debounce } from '../../utils/debounce'
import { UploadButton } from '../UploadButton'
import { getBase64 } from '../../utils/imageUtils'
import { Button } from '../UI/Button'
import DownloadIcon from '../icons/DownloadIcon'
import BrushIcon from '../icons/BrushIcon'
import EraserIcon from '../icons/EraserIcon'
import { savePrompt, SourceProcessing } from '../../utils/promptUtils'
import UndoIcon from '../icons/UndoIcon'
import RedoIcon from '../icons/RedoIcon'

const maxSize = {
  height: 768,
  width: 512
}

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

const PaintCanvas = () => {
  const router = useRouter()
  const [drawMode, setDrawMode] = useState<string>('paint')

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

  const handleFileSelect = async (file: any) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!file) {
      return
    }

    if (!canvasRef.current) {
      return
    }

    const { readAndCompressImage } = await import('browser-image-resizer')
    let resizedImage = await readAndCompressImage(file, {
      quality: 0.9,
      maxWidth: 1024,
      maxHeight: 1024
    })

    let fullDataString: string = ''

    if (file) {
      fullDataString = await getBase64(resizedImage)
    }

    if (!fullDataString) {
      return
    }

    fabric.Image.fromURL(fullDataString, function (image) {
      if (!canvasRef.current) {
        return
      }
      resetCanvas()

      const maxSize = 768
      let height = image.height || maxSize
      let width = image.width || maxSize

      if (width !== maxSize || height !== maxSize) {
        if (width > height) {
          image.scaleToWidth(maxSize)
          height = maxSize * (height / width)
          width = maxSize
        } else {
          image.scaleToHeight(maxSize)
          width = maxSize * (width / height)
          height = maxSize
        }
      }

      // Init canvas settings
      canvasRef.current.isDrawingMode = true
      canvasRef.current.setHeight(height)
      canvasRef.current.setWidth(width)

      // Generate various layers
      imageLayerRef.current = makeNewLayer({
        image,
        layerHeight: height,
        layerWidth: width
      })
      visibleDrawLayerRef.current = makeNewLayer({
        layerHeight: height,
        layerWidth: width
      })
      visibleDrawLayerRef.current.set('opacity', 0.8)
      drawLayerRef.current = makeInvisibleDrawLayer(height, width)

      // Add to Canvas
      canvasRef?.current?.add(imageLayerRef.current)
      canvasRef?.current?.add(visibleDrawLayerRef.current)

      if (brushPreviewRef.current) {
        canvasRef?.current?.add(brushPreviewRef.current)
      }
    })
  }

  const downloadWebp = (base64Data: string, fileName = 'test') => {
    const linkSource = `${base64Data}`
    const downloadLink = document.createElement('a')
    downloadLink.href = linkSource
    downloadLink.download = fileName.substring(0, 255) + '.webp' // Only get first 255 characters so we don't break the max file name limit
    downloadLink.click()
  }

  ///////////////////////

  const initCanvas = () => {
    canvasRef.current = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: 'white',
      isDrawingMode: false,
      height: 768,
      width: 512
    })

    canvasRef.current.freeDrawingCursor = 'crosshair'
    canvasRef.current.selection = false
    canvasRef.current.setHeight(512)
    canvasRef.current.setWidth(768)
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
    pathCreate(path)
    redoHistory.push(path)
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

  const saveImageMask = () => {
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

    downloadWebp(drawLayerRef.current.toDataURL({ format: 'webp' }), 'mask')
    downloadWebp(imageLayerRef.current.toDataURL({ format: 'webp' }), 'image')

    console.log(`data:`, data)
    return data
  }

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

  const handleToggle = () => {
    if (drawModeRef.current === 'paint') {
      setDrawMode('erase')
      drawModeRef.current = 'erase'
      setBrush('red')
    } else {
      setDrawMode('paint')
      drawModeRef.current = 'paint'
      setBrush('white')
    }
  }

  const handleUseImageClick = () => {
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

    savePrompt({
      imageType: 'image/webp',
      sampler: 'k_euler_a',

      source_processing: SourceProcessing.InPainting,
      source_image: data.image,
      source_mask: data.mask,
      orientation: 'custom',
      height: canvasRef.current.height,
      width: canvasRef.current.width
    })

    router.push(`/?edit=true`)
  }

  useEffect(() => {
    redoHistory = []
    undoHistory = []
    initCanvas()

    return () => {
      canvasRef?.current?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="flex flex-row gap-2 mb-2">
        <Button onClick={handleToggle}>
          {drawMode === 'paint' ? <BrushIcon /> : <EraserIcon />}
        </Button>
        <UploadButton label="" handleFile={handleFileSelect} />
        <Button onClick={saveImageMask}>
          <DownloadIcon />
        </Button>
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
        <Button onClick={handleUseImageClick}>USE</Button>
      </div>
      <StyledCanvas id="canvas" ref={canvasElementRef} />
    </div>
  )
}

export default PaintCanvas
