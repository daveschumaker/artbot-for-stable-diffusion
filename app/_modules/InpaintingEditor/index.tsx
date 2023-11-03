import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useInput } from '../InputProvider/context'
import InpaintingCanvas from 'app/_data-models/InpaintingCanvas'
import ToolBar from './Toolbar'
import styles from './inpaintingEditor.module.css'
import { getMaxValidCanvasWidth } from 'app/_utils/fabricUtils'
import { getImageDimensions } from 'app/_utils/imageUtils'

function InpaintingEditor() {
  const { input, setInput } = useInput()
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const [myCanvas, setMyCanvas] = useState<any>(null)
  const [ref, setRef] = useState<any>()

  const initCanvas = useCallback(async () => {
    const canvas = new InpaintingCanvas({
      setInput
    })

    if (input.source_image) {
      getImageDimensions('source', input.source_image)
      await canvas.importImage(input.source_image)
    }

    if (input.source_mask) {
      getImageDimensions('mask', input.source_mask)
      canvas.importMask(input.source_mask)
    }

    canvas.enableDrawing()

    setRef(canvas)
    setMyCanvas(canvas)
  }, [input.source_image, input.source_mask, setInput])

  useEffect(() => {
    if (!myCanvas) {
      initCanvas()
    }

    return () => {
      if (myCanvas) {
        myCanvas?.unload()
      }

      if (canvas.current) {
        ;(canvas.current as any)?.dispose()
        canvas.current = null
        return
      }
    }
  }, [initCanvas, myCanvas])

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
