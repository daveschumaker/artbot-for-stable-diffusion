import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { fabric } from 'fabric'
import styled from 'styled-components'

//@ts-ignore
import { GithubPicker } from 'react-color'

import { Button } from '../UI/Button'
import UndoIcon from '../icons/UndoIcon'
import RedoIcon from '../icons/RedoIcon'
import SelectComponent from '../UI/Select'
import TrashIcon from '../icons/TrashIcon'
import CaptureClickOverlay from '../UI/CaptureClickOverly'
import BrushIcon from '../icons/BrushIcon'
import SprayIcon from '../icons/SprayIcon'
import { trackEvent } from '../../api/telemetry'
import {
  getSessionPaintCache,
  setSessionPaintCache
} from '../../utils/paintUtils'
import CloudDownloadIcon from '../icons/CloudDownloadIcon'
import { UploadButton } from '../UploadButton'
import { getBase64 } from '../../utils/imageUtils'

const canvasSizes = {
  landscape: {
    height: 512,
    width: 768
  },
  portrait: {
    height: 768,
    width: 512
  },
  square: {
    height: 512,
    width: 512
  }
}

const defaultSettings = {
  backgroundColor: 'white',
  height: 512,
  isDrawingMode: true,
  width: 768
}

const Toolbar = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 52px;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0;
  position: relative;
  width: 100%;
`

const BottomOptions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
`

const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const StyledCanvas = styled.canvas`
  border: 1px solid ${(props) => props.theme.border};
`

const ColorButton = styled.div`
  border-radius: 50%;
  background-color: ${(props) => props.color};
  border: 1px solid ${(props) => props.theme.inputText};
  cursor: pointer;
  height: 20px;
  width: 20px;
  position: relative;
`

const WrappedPicker = styled.div`
  background-color: white;
  position: absolute;
  z-index: 20;
  top: 50px;
  right: 0;
`

const calcWindowSizes = (orientation: any) => {
  let width = window.innerWidth
  const padding = 32

  let containerWidth = 1024 - padding

  if (width < 1280) {
    containerWidth = 768 - padding
  }

  if (width < 1024) {
    containerWidth = 768 - 48
  }

  if (width < 768) {
    containerWidth = width - 64
  }

  if (width < 640) {
    containerWidth = width - 46
  }

  if (orientation === 'landscape') {
    const newHeight = Math.round(
      (canvasSizes.landscape.height * containerWidth) /
        canvasSizes.landscape.width
    )

    return {
      height: newHeight,
      width: containerWidth
    }
  } else if (orientation === 'portrait') {
    const newWidth = containerWidth - padding
    const newHeight = Math.round(
      (canvasSizes.portrait.height * newWidth) / canvasSizes.portrait.width
    )

    return {
      height: newHeight,
      width: newWidth
    }
  } else {
    const newSize = containerWidth - padding

    return {
      height: newSize,
      width: newSize
    }
  }

  //@ts-ignore
  return Object.assign({}, canvasSizes[orientation])
}

interface Props {
  setActiveNav: any
  setInput: any
}

const PaintCanvas = ({ setActiveNav, setInput }: Props) => {
  const router = useRouter()

  const [orientation, setOrientation] = useState({
    value: 'landscape',
    label: 'Landscape'
  })

  const [brushType, setBrushType] = useState('Pencil')
  const [brushSize, setBrushSize] = useState({ value: 1, label: '1px' })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [brushColor, setBrushColor] = useState('#000000')

  const isDrawingRef = React.useRef<boolean>(false)

  const canvasRef = React.useRef<HTMLDivElement>(null)
  const fabricRef = React.useRef<HTMLDivElement>(null)

  const changeBrushType = (type: string) => {
    // Spray / Pencil
    setBrushType(type)
    //@ts-ignore
    const brush = new fabric[type + 'Brush'](fabricRef.current)
    brush.color = brushColor // Keep existing size
    brush.width = brushSize.value // Keep existing color
    //@ts-ignore
    fabricRef.current.freeDrawingBrush = brush
  }

  const changeBrushSize = (obj: any) => {
    let Brush = brushType === 'Pencil' ? fabric.PencilBrush : fabric.SprayBrush

    // @ts-ignore
    const brush = new Brush(fabricRef.current)
    brush.color = brushColor // Keep same brush color
    brush.width = obj.value
    // @ts-ignore
    fabricRef.current.freeDrawingBrush = brush
    setBrushSize(obj)
  }

  const changeBrushColor = (color: any) => {
    let Brush = brushType === 'Pencil' ? fabric.PencilBrush : fabric.SprayBrush
    const { hex: value } = color

    // @ts-ignore
    const brush = new Brush(fabricRef.current)
    brush.color = value
    brush.width = brushSize.value // Keep brush size
    // @ts-ignore
    fabricRef.current.freeDrawingBrush = brush
    setBrushColor(value)
    setShowColorPicker(false)
  }

  const changeOrientation = (obj: any) => {
    setOrientation(obj)

    const result = calcWindowSizes(obj.value)
    const { height, width } = result

    // @ts-ignore
    fabricRef.current.clear()

    //@ts-ignore
    fabricRef.current.loadFromJSON(defaultSettings)
    //@ts-ignore
    fabricRef.current.setDimensions({
      width,
      height
    })

    window.scrollTo(0, 0)
  }

  const initFabric = () => {
    const initSettings = Object.assign({}, defaultSettings)

    const data = calcWindowSizes(orientation.value)

    initSettings.width = data.width
    initSettings.height = data.height

    // basically: fabricRef.current === canvas
    // @ts-ignore
    fabricRef.current = new fabric.Canvas(canvasRef.current, initSettings)
    //@ts-ignore
    fabricRef.current.on('path:created', () => {
      isDrawingRef.current = true
    })
  }

  useEffect(() => {
    const disposeFabric = () => {
      //@ts-ignore
      fabricRef?.current?.dispose()
    }

    initFabric()

    return () => {
      // Automatically save drawing when moving away from page.
      if (isDrawingRef.current === true) {
        //@ts-ignore
        const data = fabricRef.current.toDataURL({
          format: 'png',
          multiplier: 1
        })

        // Automatically save canvas when we leave page.
        setSessionPaintCache(data)
      }

      disposeFabric()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = async (file: any) => {
    if (typeof window === 'undefined') {
      return
    }

    const windowSize = calcWindowSizes(orientation.value)

    let imgConfig = {
      quality: 0.9,
      maxWidth: 10000,
      maxHeight: 10000
    }

    windowSize.width <= windowSize.height
      ? (imgConfig.maxWidth = windowSize.width)
      : (imgConfig.maxHeight = windowSize.height)

    const { readAndCompressImage } = await import('browser-image-resizer')
    let resizedImage = await readAndCompressImage(file, imgConfig)

    let fullDataString

    if (file) {
      fullDataString = await getBase64(resizedImage)
    }

    if (!fullDataString) {
      return
    }

    // @ts-ignore
    fabric.Image.fromURL(fullDataString, function (img) {
      //@ts-ignore
      fabricRef.current.clear()
      //@ts-ignore
      fabricRef.current.loadFromJSON(defaultSettings)

      //@ts-ignore
      fabricRef.current.add(img)
      img.viewportCenter()
      isDrawingRef.current = true
    })
  }

  const loadPrevious = () => {
    const data = getSessionPaintCache()
    //@ts-ignore
    fabric.Image.fromURL(data, function (img) {
      //@ts-ignore
      fabricRef.current.add(img)
    })
  }

  const sendToImg2Img = () => {
    trackEvent({
      event: 'USE_PAINTED_FOR_IMG2IMG',
      context: 'PaintPage'
    })

    //@ts-ignore
    const data = fabricRef.current.toDataURL({
      format: 'png',
      multiplier: 1
    })

    setSessionPaintCache(data)

    const imageType = 'image/png'
    const base64String = data.split('data:image/png;base64,')[1]

    setInput({
      img2img: true,
      imageType,
      //@ts-ignore
      height: canvasSizes[orientation.value].height,
      //@ts-ignore
      width: canvasSizes[orientation.value].width,
      source_image: base64String,
      source_processing: 'img2img'
    })

    setActiveNav('img2img')
    router.push('?panel=img2img')
  }

  // <div className="overflow-x-hidden">
  return (
    <div>
      <Toolbar>
        <div className="flex flex-row gap-1">
          <Button
            //@ts-ignore
            onClick={() => fabricRef.current.undo()}
          >
            <UndoIcon />
          </Button>
          <Button
            //@ts-ignore
            onClick={() => fabricRef.current.redo()}
          >
            <RedoIcon />
          </Button>
        </div>
        <div className="flex flex-row gap-1">
          <Button
            //@ts-ignore
            onClick={() => changeBrushType('Pencil')}
          >
            <BrushIcon />
          </Button>
          <Button
            //@ts-ignore
            onClick={() => changeBrushType('Spray')}
          >
            <SprayIcon />
          </Button>
        </div>
        <ColorButton
          color={brushColor}
          onClick={() => {
            if (!showColorPicker) {
              setShowColorPicker(true)
            }
          }}
        >
          {showColorPicker && (
            <>
              <CaptureClickOverlay
                handleClick={() => setShowColorPicker(false)}
              />
              <WrappedPicker>
                <GithubPicker
                  triangle="top-right"
                  color={brushColor}
                  onChange={changeBrushColor}
                />
              </WrappedPicker>
            </>
          )}
        </ColorButton>
        <div style={{ width: '80px' }}>
          <SelectComponent
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            options={[
              { value: 1, label: '1px' },
              { value: 5, label: '5px' },
              { value: 10, label: '10px' },
              { value: 20, label: '20px' },
              { value: 50, label: '50px' },
              { value: 100, label: '100px' },
              { value: 250, label: '250px' }
            ]}
            isSearchable={false}
            onChange={changeBrushSize}
            //@ts-ignore
            value={brushSize}
          />
        </div>

        <Button
          theme="secondary"
          onClick={() => {
            isDrawingRef.current = false
            //@ts-ignore
            fabricRef.current.clear()
            //@ts-ignore
            fabricRef.current.loadFromJSON(defaultSettings)
          }}
        >
          <TrashIcon />
        </Button>
      </Toolbar>
      <BottomOptions>
        <div className="flex flex-row gap-2">
          <UploadButton
            label="Import"
            //@ts-ignore
            handleFile={handleFileSelect}
          />
          <SelectComponent
            options={[
              { value: 'landscape', label: 'Landscape' },
              { value: 'portrait', label: 'Portrait' },
              { value: 'square', label: 'square' }
            ]}
            isSearchable={false}
            onChange={changeOrientation}
            value={orientation}
            menuPlacement="auto"
          />
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={loadPrevious}>
            <CloudDownloadIcon /> Restore
          </Button>
          <Button onClick={sendToImg2Img}>Use Drawing</Button>
        </div>
      </BottomOptions>
      <CanvasWrapper>
        <StyledCanvas
          id="canvas"
          //@ts-ignore
          ref={canvasRef}
        />
      </CanvasWrapper>
    </div>
  )
}

export default PaintCanvas
