import { fabric } from 'fabric'
import styled from 'styled-components'
import 'fabric-history'
import { useEffect, useRef } from 'react'
import { UploadButton } from '../UploadButton'
import { getBase64 } from '../../utils/imageUtils'
import { Button } from '../UI/Button'
import DownloadIcon from '../icons/DownloadIcon'

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
  const brushRef = useRef<any>(null)
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

      // Init canvas settings
      resetCanvas()
      canvasRef.current.isDrawingMode = true
      canvasRef.current.setHeight(512)
      canvasRef.current.setWidth(768)

      // Generate various layers
      imageLayerRef.current = makeNewLayer({ image })
      visibleDrawLayerRef.current = makeNewLayer()
      visibleDrawLayerRef.current.set('opacity', 0.8)
      drawLayerRef.current = makeInvisibleDrawLayer()

      // Add to Canvas
      canvasRef?.current?.add(imageLayerRef.current)
      canvasRef?.current?.add(visibleDrawLayerRef.current)
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
    canvasRef.current.on('path:created', onPathCreated)

    setBrush('white')
  }

  const makeInvisibleDrawLayer = () => {
    const newDrawLayer = new fabric.Canvas(null)

    newDrawLayer.backgroundColor = 'black'
    newDrawLayer.selection = false
    newDrawLayer.setHeight(512)
    newDrawLayer.setWidth(768)

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

  const onPathCreated = async (e: any) => {
    if (
      !canvasRef.current ||
      !drawLayerRef.current ||
      !visibleDrawLayerRef.current
    ) {
      return
    }

    const path = e.path
    path.opacity = 1
    path.selectable = false

    const drawLayerPath = (await asyncClone(path)) as fabric.Path
    const visibleLayerPath = (await asyncClone(path)) as fabric.Path

    drawLayerRef.current.add(drawLayerPath)
    visibleDrawLayerRef.current.addWithUpdate(visibleLayerPath)
    canvasRef.current.remove(path)
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

    downloadWebp(drawLayerRef.current.toDataURL({ format: 'webp' }))

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

  useEffect(() => {
    initCanvas()

    return () => {
      canvasRef?.current?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="flex flex-row gap-2 mb-2">
        <UploadButton label="" handleFile={handleFileSelect} />
        <Button onClick={saveImageMask}>
          <DownloadIcon />
        </Button>
      </div>
      <StyledCanvas id="canvas" ref={canvasElementRef} />
    </div>
  )
}

export default PaintCanvas
