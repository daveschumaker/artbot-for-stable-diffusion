import React, { useRef, useState } from 'react'
import { useInput } from '../InputProvider/context'
import InpaintingCanvas from 'app/_data-models/InpaintingCanvas'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import ToolBar from './Toolbar'
import styles from './inpaintingEditor.module.css'
import { getMaxValidCanvasWidth } from 'app/_utils/fabricUtils'

function InpaintingEditor() {
  const { input, setInput } = useInput()
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const [ref, setRef] = useState<any>()

  const initCanvas = () => {
    const myCanvas = new InpaintingCanvas({
      setInput,
      source_image: input.source_image
    })

    if (input.source_mask) {
      myCanvas.importMask(input.source_mask)
    }

    myCanvas.enableDrawing()
    setRef(myCanvas)

    return myCanvas
  }

  useEffectOnce(() => {
    const myCanvas = initCanvas()

    return () => {
      if (!canvas.current) {
        return
      }

      myCanvas?.unload()
      ;(canvas.current as any)?.dispose()
      canvas.current = null
    }
  })

  const maxCanvasWidth = getMaxValidCanvasWidth()

  return (
    <div>
      <ToolBar
        canvas={ref}
        // handleNewCanvas={() => {}}
        // handleRemoveClick={handleRemoveClick}
      />
      <div
        className="w-full"
        id="canvas-wrapper"
        style={{
          margin: '0 auto',
          maxWidth: `${maxCanvasWidth}px`
        }}
      >
        <div className="relative">
          <canvas id="canvas_v2" className={styles.canvas} />
          <canvas
            id="canvas_mask"
            className={styles.canvas}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(InpaintingEditor)
