import React, { useRef, useState } from 'react'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { getCanvasStore, resetSavedDrawingState } from 'app/_store/canvasStore'
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
  const canvas = useRef(null)
  const [ref, setRef] = useState()
  const [canvasState, setCanvasState] = useState(null)

  const initCanvas = (
    height: number,
    width: number,
    bgColor: string = '#ffffff'
  ) => {
    // @ts-ignore
    canvas.current = CreateCanvas.init({
      canvasId,
      bgColor
    })
    const myCanvas = new CreateCanvas({
      // @ts-ignore
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

    //@ts-ignore
    setRef(myCanvas)

    if (getCanvasStore().drawLayer || getCanvasStore().clonedCanvasObj) {
      myCanvas.restoreCanvas()
    }

    // @ts-ignore
    setCanvasState(myCanvas)
    return myCanvas
  }

  const handleNewCanvas = (height: number, width: number, bgColor: string) => {
    if (!canvas.current || !canvasState) {
      return
    }

    // @ts-ignore
    canvasState.clear()

    // @ts-ignore
    canvas?.current?.dispose()
    canvas.current = null
    resetSavedDrawingState()

    initCanvas(height, width, bgColor)
  }

  useEffectOnce(() => {
    let height = 512
    let width = 512

    if (canvasType === 'drawing') {
      let container = document.querySelector('#canvas-wrapper')
      // @ts-ignore
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

      // @ts-ignore
      canvas?.current?.dispose()
      canvas.current = null
    }
  })

  return (
    <div className={editorClassName}>
      <ToolBar
        // @ts-ignore
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
