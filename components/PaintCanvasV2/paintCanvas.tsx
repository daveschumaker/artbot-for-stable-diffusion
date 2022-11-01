import { fabric } from 'fabric'
import styled from 'styled-components'
import 'fabric-history'
import { useEffect, useRef } from 'react'

interface CanvasProps {
  ref: any
}

interface LayerParams {
  absolute?: boolean
  fill?: string
  image?: fabric.Image
  layerHeight?: number
  layerWidth?: number
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

    setBrush('white')
    makeNewDrawingLayer()
  }

  const makeInvisibleDrawLayer = () => {
    const newDrawLayer = new fabric.Canvas(null)

    newDrawLayer.backgroundColor = 'black'
    newDrawLayer.selection = false
    newDrawLayer.setHeight(512)
    newDrawLayer.setWidth(768)

    return newDrawLayer
  }

  const makeNewDrawingLayer = () => {
    if (!canvasRef.current) {
      return
    }

    resetCanvas()

    canvasRef.current.isDrawingMode = true
    canvasRef.current.setHeight(512)
    canvasRef.current.setWidth(768)

    visibleDrawLayerRef.current = makeNewLayer()
    visibleDrawLayerRef.current.set('opacity', 0.8)
    canvasRef.current.add(visibleDrawLayerRef.current)

    makeInvisibleDrawLayer()
  }

  const makeNewLayer = ({
    absolute = true,
    fill = 'transparent',
    image,
    layerHeight = 512,
    layerWidth = 768
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
      absolutePositioned: absolute
    })

    return newGroup
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
      <StyledCanvas id="canvas" ref={canvasElementRef} />
    </div>
  )
}

export default PaintCanvas
