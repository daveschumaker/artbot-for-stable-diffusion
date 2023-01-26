import React, { useRef, useState } from 'react'
import { useEffectOnce } from '../../../hooks/useEffectOnce'
import { getCanvasStore } from '../../../store/canvasStore'
import CreateCanvas from '../../../models/CreateCanvas'
import ToolBar from './toolbar'

interface IProps {
  handleRemoveClick: () => void
  setInput: () => void
}

const Editor = ({ handleRemoveClick, setInput }: IProps) => {
  const canvas = useRef(null)
  const [ref, setRef] = useState()

  useEffectOnce(() => {
    // @ts-ignore
    canvas.current = CreateCanvas.init()
    // @ts-ignore
    const myCanvas = new CreateCanvas({ canvas: canvas.current, setInput })
    myCanvas.attachLayers()

    //@ts-ignore
    setRef(myCanvas)

    if (getCanvasStore().drawLayer) {
      myCanvas.restoreCanvas()
    }

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
    <div>
      <ToolBar
        // @ts-ignore
        canvas={ref}
        handleRemoveClick={handleRemoveClick}
      />
      <div className="w-full" id="canvas-wrapper">
        <canvas id="canvas" />
      </div>
    </div>
  )
}

export default React.memo(Editor)
