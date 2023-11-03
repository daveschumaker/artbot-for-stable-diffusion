interface InpaintingCanvasOptions {
  setInput: (data: Partial<DefaultPromptInput>) => void
}

interface Point {
  x: number
  y: number
}

import { SourceProcessing } from '_types/horde'
import DefaultPromptInput from './DefaultPromptInput'
import { inferMimeTypeFromBase64 } from 'app/_utils/imageUtils'

class InpaintingCanvas {
  setInput: (data: Partial<DefaultPromptInput>) => void
  private undoStack: string[] = []
  private redoStack: string[] = []

  private brushSize: number = 20
  private imageCanvas: HTMLCanvasElement
  private imageCtx: CanvasRenderingContext2D

  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  private isEraseMode: boolean = false

  private originalWidth: number
  private originalHeight: number

  constructor(options: InpaintingCanvasOptions) {
    // Create the image and mask canvases
    this.imageCanvas = document.getElementById('canvas_v2') as HTMLCanvasElement
    if (!this.imageCanvas) {
      throw new Error("Could not find canvas element with ID 'canvas'.")
    }
    this.imageCtx = this.imageCanvas.getContext('2d')!

    this.maskCanvas = document.getElementById(
      'canvas_mask'
    ) as HTMLCanvasElement
    this.maskCtx = this.maskCanvas.getContext('2d')!
    this.maskCtx.strokeStyle = 'rgba(255, 255, 255, 0)'

    // this.maskCanvas.style.zIndex = '100'
    this.maskCanvas.style.cursor = 'crosshair'

    this.originalWidth = 0
    this.originalHeight = 0

    this.imageCanvas.parentElement?.appendChild(this.maskCanvas)

    this.maskCanvas.style.position = 'absolute'
    this.maskCanvas.style.top = '0'
    this.maskCanvas.style.left = '0'
    this.maskCanvas.style.opacity = '0.7'

    this.setInput = options.setInput
  }

  private captureCanvasState(): string {
    return this.maskCanvas.toDataURL()
  }

  static outputMask(base64: string): Promise<string> {
    let fullDataString = base64

    if (fullDataString.indexOf('data:') === -1) {
      fullDataString = `data:${inferMimeTypeFromBase64(
        base64
      )};base64,${base64}`
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Create a canvas and draw the image onto it
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject('Failed to get 2d context')
          return
        }
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Iterate over the image data
        for (let i = 0; i < imageData.data.length; i += 4) {
          const alpha = imageData.data[i + 3]
          if (alpha === 0) {
            // Transparent pixel
            imageData.data[i] = 0 // R
            imageData.data[i + 1] = 0 // G
            imageData.data[i + 2] = 0 // B
          } else {
            // Non-transparent pixel
            imageData.data[i] = 255 // R
            imageData.data[i + 1] = 255 // G
            imageData.data[i + 2] = 255 // B
          }
          imageData.data[i + 3] = 255 // Set alpha to fully opaque
        }

        // Put the modified image data back onto the canvas
        ctx.putImageData(imageData, 0, 0)

        // Convert the canvas back to a base64 string
        const modifiedBase64 = canvas.toDataURL()
        const [, base64str] = modifiedBase64.split(',')
        resolve(base64str)
      }

      img.onerror = () => {
        reject('Failed to load image')
      }

      img.src = fullDataString
    })
  }

  clearMaskCanvas = (): void => {
    // Get the context of the maskCanvas
    const maskCtx = this.maskCanvas.getContext('2d')

    if (!maskCtx) {
      throw new Error('Failed to get 2d context for maskCanvas')
    }

    // Clear the entire maskCanvas by setting its pixels to be transparent
    maskCtx?.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)

    this.setInput({
      source_mask: ''
    })
  }

  download = (base64Data: string, fileName = 'test') => {
    const ext = '.png'
    const linkSource = `${base64Data}`
    const downloadLink = document.createElement('a')
    downloadLink.setAttribute('id', 'temp-download-link')
    downloadLink.href = linkSource
    downloadLink.download = fileName.substring(0, 255) + ext // Only get first 255 characters so we don't break the max file name limit
    downloadLink.click()
    downloadLink.remove()
  }

  enableDrawing(): void {
    let isDrawing = false
    let lastPoint: Point | null = null

    const getRelativePosition = (
      clientX: number,
      clientY: number,
      canvas: HTMLCanvasElement
    ): Point => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    }

    const startDrawing = () => {
      this.undoStack.push(this.captureCanvasState())
      this.maskCtx.beginPath()
      isDrawing = true
      lastPoint = null
    }

    const stopDrawing = () => {
      isDrawing = false
      this.maskCtx.closePath()
      lastPoint = null

      this.redoStack = []

      const base64string = this.exportMaskToBase64()
      this.setInput({
        source_mask: base64string
      })
    }

    const draw = (clientX: number, clientY: number) => {
      const position = getRelativePosition(clientX, clientY, this.maskCanvas)

      if (isDrawing) {
        if (this.isEraseMode) {
          this.maskCtx.globalCompositeOperation = 'destination-out'
          this.maskCtx.fillStyle = 'rgba(0, 0, 0, 1)'
        } else {
          this.maskCtx.globalCompositeOperation = 'source-over'
          this.maskCtx.fillStyle = 'rgba(255, 255, 255, 1)'
        }

        this.maskCtx.lineWidth = this.brushSize
        this.maskCtx.lineJoin = 'round' // This ensures the join between line segments is round.
        this.maskCtx.lineCap = 'round' // This ensures the end of the line segment is round.

        if (lastPoint) {
          const distance = Math.sqrt(
            (position.x - lastPoint.x) ** 2 + (position.y - lastPoint.y) ** 2
          )
          const angle = Math.atan2(
            position.y - lastPoint.y,
            position.x - lastPoint.x
          )

          for (let i = 0; i < distance; i += 1) {
            const x = lastPoint.x + i * Math.cos(angle)
            const y = lastPoint.y + i * Math.sin(angle)
            this.maskCtx.beginPath()
            this.maskCtx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2, true)
            this.maskCtx.closePath()
            this.maskCtx.fill()
          }
        }

        lastPoint = position
      }
    }

    // Mouse events
    this.maskCanvas.addEventListener('mousedown', () => {
      startDrawing()
    })

    this.maskCanvas.addEventListener('mousemove', (event: MouseEvent) => {
      draw(event.clientX, event.clientY)
    })

    // Touch events
    this.maskCanvas.addEventListener('touchstart', (event: TouchEvent) => {
      event.preventDefault()
      startDrawing()
    })

    this.maskCanvas.addEventListener('touchmove', (event: TouchEvent) => {
      event.preventDefault()
      if (isDrawing) {
        const touch = event.touches[0]
        draw(touch.clientX, touch.clientY)
      }
    })

    // End events
    // Attach global events to window
    window.addEventListener('mouseup', () => {
      stopDrawing()
    })

    window.addEventListener('touchend', () => {
      stopDrawing()
    })
    window.addEventListener('touchleave' as any, () => {
      stopDrawing()
    })

    window.addEventListener('mouseleave', () => {
      stopDrawing()
    })
    window.addEventListener('touchcancel', () => {
      stopDrawing()
    })
  }

  expandCanvas(
    direction: 'top' | 'bottom' | 'left' | 'right',
    pixels: number
  ): void {
    // Helper function to expand and fill a canvas
    const expandAndFill = (
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      fillColor: string
    ) => {
      // Create a temporary canvas and copy the current content
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.drawImage(canvas, 0, 0)

      // Adjust the size of the original canvas
      let overlap = canvas === this.maskCanvas ? 4 : 0

      switch (direction) {
        case 'top':
          canvas.height += pixels
          ctx.drawImage(tempCanvas, 0, pixels)
          ctx.fillStyle = fillColor
          ctx.fillRect(0, 0, canvas.width, pixels + overlap)
          break
        case 'bottom':
          canvas.height += pixels
          ctx.drawImage(tempCanvas, 0, 0)
          ctx.fillStyle = fillColor
          ctx.fillRect(
            0,
            canvas.height - pixels - overlap,
            canvas.width,
            pixels + overlap
          )
          break
        case 'left':
          canvas.width += pixels
          ctx.drawImage(tempCanvas, pixels, 0)
          ctx.fillStyle = fillColor
          ctx.fillRect(0, 0, pixels + overlap, canvas.height)
          break
        case 'right':
          canvas.width += pixels
          ctx.drawImage(tempCanvas, 0, 0)
          ctx.fillStyle = fillColor
          ctx.fillRect(
            canvas.width - pixels - overlap,
            0,
            pixels + overlap,
            canvas.height
          )
          break
      }
    }

    // Expand and fill the imageCanvas with red
    expandAndFill(
      this.imageCanvas,
      this.imageCtx,
      this.getAverageColor(this.imageCanvas)
    )

    // Expand and fill the maskCanvas with green
    expandAndFill(this.maskCanvas, this.maskCtx, 'rgba(255, 255, 255, 1)')

    this.setInput({
      source_image: this.exportImageCanvasToBase64(),
      source_mask: this.exportMaskCanvasToBase64(),
      source_processing: SourceProcessing.InPainting
    })
  }

  exportImageCanvasToBase64(): string {
    // Directly get the base64 representation of the imageCanvas content.
    const base64String = this.imageCanvas.toDataURL('image/png') // assuming you want a PNG format

    // Optional: Strip out the MIME type prefix (if you don't want it included)
    const base64Data = base64String.split(',')[1]

    return base64Data
  }

  exportMaskCanvasToBase64(): string {
    // Directly get the base64 representation of the imageCanvas content.
    const base64String = this.maskCanvas.toDataURL('image/png') // assuming you want a PNG format

    // Optional: Strip out the MIME type prefix (if you don't want it included)
    const base64Data = base64String.split(',')[1]

    return base64Data
  }

  // Export the mask as a base64 string
  exportMaskForHorde(): string {
    const exportCanvas = document.createElement('canvas')
    const exportCtx = exportCanvas.getContext('2d')!

    const width = this.maskCanvas.width
    const height = this.maskCanvas.height

    const intermediateCanvas = document.createElement('canvas')
    const intermediateCtx = intermediateCanvas.getContext('2d')!
    intermediateCanvas.width = width
    intermediateCanvas.height = height

    intermediateCtx.drawImage(this.maskCanvas, 0, 0)

    // Make sure intermediate canvas has strictly black or white pixels.
    const interImgData = intermediateCtx.getImageData(
      0,
      0,
      intermediateCanvas.width,
      intermediateCanvas.height
    )
    for (let i = 0; i < interImgData.data.length; i += 4) {
      const alpha = interImgData.data[i + 3]
      if (alpha > 0) {
        interImgData.data[i] = 255 // R
        interImgData.data[i + 1] = 255 // G
        interImgData.data[i + 2] = 255 // B
      } else {
        interImgData.data[i] = 0 // R
        interImgData.data[i + 1] = 0 // G
        interImgData.data[i + 2] = 0 // B
      }
      interImgData.data[i + 3] = 255 // A (set alpha to fully opaque)
    }
    intermediateCtx.putImageData(interImgData, 0, 0)

    // Now, we can draw the intermediate canvas to the export canvas.
    exportCanvas.width = width
    exportCanvas.height = height
    exportCtx.imageSmoothingEnabled = false
    exportCtx.drawImage(intermediateCanvas, 0, 0, width, height)

    return exportCanvas.toDataURL()
  }

  exportMaskToBase64(): string {
    // Create a temporary canvas with original dimensions
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this.originalWidth
    tempCanvas.height = this.originalHeight

    const ctx = tempCanvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')

    // Draw the maskCanvas onto the temporary canvas with original dimensions
    ctx.drawImage(
      this.maskCanvas,
      0,
      0,
      this.originalWidth,
      this.originalHeight
    )

    // Convert the temporary canvas to base64
    // Use png as webp transparency support can vary with browsers
    const fullBase64 = tempCanvas.toDataURL('image/png')
    const [, imgBase64String] = fullBase64.split(';base64,')
    return imgBase64String
  }

  fillCanvas({
    ctx,
    direction,
    expandedCanvas,
    fillColor,
    overlap = 0,
    pixels
  }: {
    ctx: CanvasRenderingContext2D
    direction: string
    expandedCanvas: HTMLCanvasElement
    fillColor: string
    overlap?: number
    pixels: number
  }) {
    ctx.fillStyle = fillColor

    switch (direction) {
      case 'top':
        ctx.fillRect(0, 0, expandedCanvas.width, pixels + overlap)
        break
      case 'bottom':
        ctx.fillRect(
          0,
          expandedCanvas.height - pixels - overlap,
          expandedCanvas.width,
          pixels + overlap
        )
        break
      case 'left':
        ctx.fillRect(0, 0, pixels + overlap, expandedCanvas.height)
        break
      case 'right':
        ctx.fillRect(
          expandedCanvas.width - pixels - overlap,
          0,
          pixels + overlap,
          expandedCanvas.height
        )
        break
    }
  }

  getAverageColor(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let red = 0,
      green = 0,
      blue = 0
    // alpha = 0

    for (let i = 0; i < imageData.length; i += 4) {
      red += imageData[i]
      green += imageData[i + 1]
      blue += imageData[i + 2]
      // alpha += imageData[i + 3]
    }

    const pixelCount = canvas.width * canvas.height
    const colors = [red / pixelCount, green / pixelCount, blue / pixelCount]
    return `rgb(${colors[0]},${colors[1]},${colors[2]})`
  }

  importImage(source_image: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const fullDataString = `data:${inferMimeTypeFromBase64(
          source_image
        )};base64,${source_image}`

        const img = new Image()
        img.onload = () => {
          // Store original dimensions
          this.originalWidth = img.width
          this.originalHeight = img.height

          let width = img.width
          let height = img.height

          // Check if the image width is greater than 3072px
          if (width > 3072) {
            // Calculate the new height proportionally
            const ratio = height / width
            width = 3072
            height = width * ratio
          }

          // Resize and draw on both canvases
          this.imageCanvas.width = width
          this.imageCanvas.height = height

          this.maskCanvas.width = width
          this.maskCanvas.height = height

          this.imageCtx.drawImage(img, 0, 0, width, height)

          // Once everything is done, resolve the promise
          resolve()
        }
        img.onerror = reject // Reject the promise on an error
        img.src = fullDataString
      } catch (e) {
        console.log(`Error:`, e)
        reject(e) // Reject the promise if an exception occurs
      }
    })
  }

  importMask(base64String: string): void {
    try {
      const fullDataString = `data:${inferMimeTypeFromBase64(
        base64String
      )};base64,${base64String}`

      const img = new Image()
      img.onload = async () => {
        let width = this.imageCanvas.width
        let height = this.imageCanvas.height

        // Check if the image width is greater than 3072px
        if (width > 3072) {
          // Calculate the new height proportionally
          const ratio = height / width
          width = 3072
          height = width * ratio
        }

        this.maskCanvas.width = width
        this.maskCanvas.height = height

        this.maskCtx.drawImage(img, 0, 0, width, height)
      }
      img.src = fullDataString

      this.setInput({
        source_processing: SourceProcessing.InPainting
      })
    } catch (e) {
      console.log(`Error:`, e)
    }
  }

  setBrushSize(size: number): void {
    if (size < 2) size = 2
    if (size > 300) size = 300

    this.brushSize = size
  }

  setCheckerboardBackground(): Promise<void> {
    return new Promise((resolve) => {
      const bgImgSrc = '/artbot/checkerboard.png'
      const bgImg = new Image()
      bgImg.onload = () => {
        const pattern = this.imageCtx.createPattern(bgImg, 'repeat')
        if (pattern) {
          this.imageCtx.fillStyle = pattern
          this.imageCtx.fillRect(
            0,
            0,
            this.imageCanvas.width,
            this.imageCanvas.height
          )
        }
        resolve() // Resolve the promise once the background is set
      }
      bgImg.src = bgImgSrc
    })
  }

  redo = (): void => {
    if (this.redoStack.length === 0) return // Nothing to redo

    const nextState = this.redoStack.pop()
    this.undoStack.push(this.captureCanvasState()) // Save current state before redoing

    const img = new Image()
    img.onload = () => {
      this.maskCtx.clearRect(
        0,
        0,
        this.maskCanvas.width,
        this.maskCanvas.height
      )
      this.maskCtx.drawImage(img, 0, 0)
    }
    img.src = nextState!
  }

  saveToDisk = async () => {
    try {
      // const mask = await InpaintingCanvas.outputMask(
      //   this.maskCanvas.toDataURL()
      // )

      // this.download(mask, '_mask')
      this.download(this.imageCanvas.toDataURL(), 'inpainting_img')
      this.download(this.maskCanvas.toDataURL(), 'inpainting_mask')
    } catch (err) {
      console.log(`Error downloading image and mask:`, err)
    }
  }

  toggleErase(bool?: boolean): void {
    if (bool === true || bool === false) {
      this.isEraseMode = bool
    } else {
      this.isEraseMode = !this.isEraseMode
    }
  }

  undo = (): void => {
    if (this.undoStack.length === 0) return // Nothing to undo

    const lastState = this.undoStack.pop()
    this.redoStack.push(this.captureCanvasState()) // Save current state before undoing

    const img = new Image()
    img.onload = () => {
      this.maskCtx.clearRect(
        0,
        0,
        this.maskCanvas.width,
        this.maskCanvas.height
      )
      this.maskCtx.drawImage(img, 0, 0)
    }
    img.src = lastState!
  }

  unload() {
    // this.disableDrawing()
  }
}

export default InpaintingCanvas
