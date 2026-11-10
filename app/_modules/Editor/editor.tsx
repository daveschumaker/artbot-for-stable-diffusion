import React, { useRef, useState } from 'react'
import type { Canvas } from 'fabric'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import {
  getCanvasStore,
  resetSavedDrawingState,
  storeCanvas
} from 'app/_store/canvasStore'
import CreateCanvas from 'app/_data-models/CreateCanvas'
import ToolBar from './components/toolbar'
import { EditorProps } from '_types/props'

const Editor = ({
  canvasId = 'canvas',
  canvasType = 'inpainting',
  handleRemoveClick,
  hideCanvas = false,
  source_image,
  source_image_height,
  source_image_width,
  setInput = () => {},
  toolbarClassName = '',
  editorClassName = '',
  canvasHeight,
  canvasWidth,
  toolbarAbsolute = false,
  toolbarDisableMenu = false
}: EditorProps) => {
  // CreateCanvas.init returns undefined if fabric fails to create the canvas.
  const canvas = useRef<Canvas | null | undefined>(null)
  const [ref, setRef] = useState<CreateCanvas>()
  const [canvasState, setCanvasState] = useState<CreateCanvas | null>(null)

  const initCanvas = (
    height: number,
    width: number,
    bgColor: string = '#ffffff'
  ) => {
    canvas.current = CreateCanvas.init({
      canvasId,
      bgColor
    })
    const myCanvas = new CreateCanvas({
      canvas: canvas.current,
      canvasId,
      canvasType,
      setInput,
      height: canvasHeight ? canvasHeight : height,
      width: canvasWidth ? canvasWidth : width,
      bgColor
    })

    if (canvasType === 'inpainting') {
      myCanvas.initInpainting()
    } else if (canvasType === 'drawing') {
      myCanvas.initDrawing()
    }

    setRef(myCanvas)

    if (getCanvasStore().drawLayer || getCanvasStore().clonedCanvasObj) {
      myCanvas.restoreCanvas()
    }

    setCanvasState(myCanvas)
    return myCanvas
  }

  const handleNewCanvas = async (
    height: number,
    width: number,
    bgColor: string
  ) => {
    if (!canvas.current || !canvasState) {
      return
    }

    canvasState.clear()

    // Fabric's dispose is asynchronous, and the element can't be reused until it finishes.
    await canvas?.current?.dispose()
    canvas.current = null
    resetSavedDrawingState()
    storeCanvas('drawLayer', null)
    storeCanvas('maskLayer', null)

    initCanvas(height, width, bgColor)
  }

  useEffectOnce(() => {
    let height = 512
    let width = 512

    if (canvasType === 'drawing') {
      let container = document.querySelector<HTMLElement>('#canvas-wrapper')
      width = container?.offsetWidth || 512

      if (width > 1024) {
        width = 1024
      }
    }

    const myCanvas = initCanvas(height, width)

    return () => {
      if (!canvas.current) {
        return
      }

      myCanvas.unload()

      canvas?.current?.dispose()
      canvas.current = null
    }
  })

  return (
    <div className={editorClassName}>
      <ToolBar
        canvas={ref}
        canvasType={canvasType}
        handleNewCanvas={handleNewCanvas}
        handleRemoveClick={handleRemoveClick}
        source_image={source_image}
        source_image_height={source_image_height}
        source_image_width={source_image_width}
        toolbarClassName={toolbarClassName}
        toolbarAbsolute={toolbarAbsolute}
        toolbarDisableMenu={toolbarDisableMenu}
      />
      <div
        className="w-full"
        id="canvas-wrapper"
        style={{ display: hideCanvas ? 'none' : 'block' }}
      >
        <canvas id={canvasId} />
      </div>
    </div>
  )
}

export default React.memo(Editor)
