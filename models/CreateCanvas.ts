import { fabric } from 'fabric'
import { getCanvasStore, getI2IString, storeCanvas } from '../store/canvasStore'
import { debounce } from '../utils/debounce'
import { getCanvasHeight } from '../utils/fabricUtils'
import { nearestWholeMultiple } from '../utils/imageUtils'
import { SourceProcessing } from '../utils/promptUtils'

interface IParams {
  canvas: fabric.Canvas
  setInput: (data: any) => void
}
class CreateCanvas {
  canvas: fabric.Canvas | null
  brushPreview: fabric.Circle | null
  brushSettings: {
    color: string
    width: number
  }
  drawLayer: fabric.Group
  imageLayer: fabric.Group | null
  isMouseDown: boolean
  erasing: boolean
  height: number
  redoHistory: Array<any>
  undoHistory: Array<any>
  historyIndex: number
  maskLayer: fabric.Canvas | null
  setInput: (data: any) => void
  width: number
  maskPathColor: string
  maskBackgroundColor: string

  constructor({ canvas, setInput = () => {} }: IParams) {
    this.setInput = setInput
    this.canvas = canvas
    this.brushPreview = null
    this.drawLayer = this.makeNewLayer({})
    this.imageLayer = null
    this.maskLayer = null
    this.height = 512
    this.width = 512

    this.brushSettings = {
      width: 20,
      color: 'white'
    }

    this.maskPathColor = 'white'
    this.maskBackgroundColor = 'black'

    this.erasing = false

    this.undoHistory = []
    this.redoHistory = []
    this.historyIndex = -1

    this.isMouseDown = false

    document.addEventListener('keyup', this.handleKeyInput)
  }

  static asyncClone = async (object: any) => {
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

  static init = ({
    height = 512,
    width = 512
  }: { height?: number; width?: number } = {}) => {
    return new fabric.Canvas('canvas', {
      backgroundColor: 'white',
      // renderOnAddRemove: true,
      isDrawingMode: false,
      height,
      width
    })
  }

  restoreCanvas = () => {
    if (!this.canvas) {
      return
    }

    const { height, width } = getCanvasStore()

    this.height = height
    this.width = width
    this.canvas.setHeight(height)
    this.canvas.setWidth(width)

    this.canvas.clear()

    this.canvas.loadFromJSON(getCanvasStore().drawLayer, () => {
      if (!this.canvas) {
        return
      }

      const objects = this.canvas.getObjects()

      // @ts-ignore
      this.drawLayer = objects[1]
      // @ts-ignore
      this.brushPreview = objects[2]

      this.createMaskLayer()
      this?.maskLayer?.loadFromJSON(getCanvasStore().maskLayer, () => {})

      this.canvas.isDrawingMode = true
    })
  }

  static invert = async (
    base64String: string,
    returnString: boolean = false
  ): Promise<fabric.Canvas | string> => {
    return new Promise((resolve) => {
      fabric.Image.fromURL(base64String, (image) => {
        if (!image) {
          return
        }

        //@ts-ignore
        image.filters.push(new fabric.Image.filters.Invert())

        // Main filter
        //@ts-ignore
        // image.filters.push(new fabric.Image.filters.BlackWhite())

        // // Remove minor gray tones ( #000, #FFF only )
        // //@ts-ignore
        // image.filters.push(new fabric.Image.filters.Grayscale())

        // // Set contrast to max value
        // //@ts-ignore
        // image.filters.push(new fabric.Image.filters.Contrast({ contrast: 1 }))

        const invertedCanvas = new fabric.Canvas(null, {
          height: image.height,
          width: image.width
        })

        invertedCanvas.add(image)
        image.applyFilters()
        invertedCanvas.renderAll()

        if (returnString) {
          const dataString = invertedCanvas
            .toDataURL({ format: 'webp' })
            .split(',')[1]
          resolve(dataString)
        } else {
          resolve(invertedCanvas)
        }
      })
    })
  }

  initBrushPreview = () => {
    this.brushPreview = new fabric.Circle({
      radius: this.brushSettings.width,
      left: 0,
      originX: 'center',
      originY: 'center',
      angle: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 1,
      opacity: 0
    })

    this.canvas?.add(this.brushPreview)
  }

  attachLayers = () => {
    if (!this.canvas) {
      return
    }

    this.importImage()
    this.canvas.isDrawingMode = true
    this.createDrawLayer({ opacity: 0.8 })

    this.canvas.add(this.drawLayer)
    this.initBrushPreview()
    this.updateBrush()
    this.initCanvasEvents()
    this.updateCanvas()
  }

  initCanvasEvents = () => {
    if (!this.canvas) {
      return
    }

    this.canvas.on('path:created', this.onPathCreated)
    this.canvas.on('mouse:move', (e: any) => {
      this.onMouseMove(e)
    })

    this.canvas.on('mouse:down', () => {
      if (!this.brushPreview) {
        return
      }

      this.isMouseDown = true
      this.brushPreview.set('strokeWidth', 0)
      this.brushPreview.set('stroke', '')
    })

    this.canvas.on('mouse:up', () => {
      if (!this.brushPreview) {
        return
      }

      this.isMouseDown = false
      this.brushPreview.set('strokeWidth', 1)
      this.brushPreview.set('stroke', 'black')
    })
  }

  autoSave = () => {
    if (!this.canvas) {
      return
    }

    // TODO: Save imageLayer and maskLayer to image job for later look ups! (And to seletively toggle mask)

    const data = {
      imageType: 'image/webp',
      source_image: '',
      source_mask: '',
      source_processing: SourceProcessing.InPainting,
      orientationType: 'custom',
      height: nearestWholeMultiple(this.canvas.height || 512),
      width: nearestWholeMultiple(this.canvas.width || 512),
      canvasData: this.canvas.toObject(),
      maskData: null
    }

    storeCanvas('drawLayer', data.canvasData)

    if (this.imageLayer) {
      data.source_image = this?.imageLayer
        ?.toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    if (this.maskLayer) {
      data.source_mask = this.maskLayer
        .toDataURL({ format: 'webp' })
        .split(',')[1]

      data.maskData = this.maskLayer.toObject()
      storeCanvas('maskLayer', data.maskData)
    }

    this.setInput({ ...data })
  }

  handleKeyInput = (e: any) => {
    if (!this.canvas) {
      return
    }

    const { keyCode, ctrlKey, shiftKey, metaKey } = e
    const isMetaKey = metaKey || e.key === 'Meta'

    // TODO: Meta keys for MacOS are not working.
    if (isMetaKey && shiftKey && keyCode === 90) {
      e.preventDefault()
      this.redo()
    } else if (ctrlKey && shiftKey && keyCode === 90) {
      e.preventDefault()
      this.redo()
    } else if (isMetaKey && keyCode === 90) {
      e.preventDefault()
      this.undo()
    } else if (ctrlKey && keyCode === 90) {
      e.preventDefault()
      this.undo()
    }
  }

  createDrawLayer({ opacity = 1.0 }: { opacity: number }) {
    this.drawLayer = this.makeNewLayer({
      layerHeight: this.height,
      layerWidth: this.width,
      opacity
    })
  }

  createMaskLayer() {
    this.maskLayer = new fabric.Canvas(null, {
      backgroundColor: this.maskBackgroundColor,
      isDrawingMode: false
    })

    this.maskLayer.selection = false
    this.maskLayer.setHeight(this.height)
    this.maskLayer.setWidth(this.width)
  }

  download = (base64Data: string, fileName = 'test') => {
    const linkSource = `${base64Data}`
    const downloadLink = document.createElement('a')
    downloadLink.setAttribute('id', 'temp-download-link')
    downloadLink.href = linkSource
    downloadLink.download = fileName.substring(0, 255) + '.webp' // Only get first 255 characters so we don't break the max file name limit
    downloadLink.click()
    downloadLink.remove()
  }

  importImage() {
    if (!this.canvas) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      if (!this.canvas) {
        return resolve(true)
      }

      const canvas = this.canvas
      const fullDataString = getI2IString().base64String

      fabric.Image.fromURL(fullDataString, (image) => {
        // const innerWidth = window.innerWidth
        // const containerWidth = getPanelWidth(innerWidth)
        let container = document.querySelector('#canvas-wrapper')
        // @ts-ignore
        const containerWidth = container?.offsetWidth || 512
        let newHeight = image.height || 512
        let newWidth = containerWidth

        // @ts-ignore
        if (image?.width > containerWidth && image.width >= image.height) {
          newHeight = getCanvasHeight({
            baseHeight: image.height,
            baseWidth: image.width,
            foundWidth: containerWidth
          })

          image.scaleToWidth(containerWidth)

          // @ts-ignore
        } else if (image.height > image.width && image.width > containerWidth) {
          newHeight = getCanvasHeight({
            baseHeight: image.height,
            baseWidth: image.width,
            foundWidth: containerWidth
          })

          image.scaleToWidth(containerWidth)
        } else if (image.height === image.width) {
          newHeight = image.height || 512
          newWidth = image.width || 512
        } else if (image.width && image.width < containerWidth) {
          newWidth = image.width
        }

        this.height = newHeight
        this.width = newWidth

        canvas.setHeight(newHeight)
        canvas.setWidth(newWidth)

        this.imageLayer = this.makeNewLayer({
          image,
          layerHeight: newHeight,
          layerWidth: newWidth
        })

        canvas.insertAt(this.imageLayer, 0, false)
        this.createMaskLayer()
        return resolve(true)
      })
    })
  }

  makeNewLayer({
    absolute = true,
    fill = 'transparent',
    image,
    layerHeight = 512,
    layerWidth = 768,
    opacity = 1
  }: any) {
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

  toggleErase = (bool: boolean) => {
    if (bool === true) {
      this.erasing = true
      this.updateBrush({ color: 'red' })
    } else if (bool === false) {
      this.erasing = false
      this.updateBrush({ color: 'white' })
    } else if (this.erasing) {
      this.erasing = false
      this.updateBrush({ color: 'white' })
    } else {
      this.erasing = true
      this.updateBrush({ color: 'red' })
    }
  }

  debounceBrushPreview = debounce(() => {
    if (!this.brushPreview || !this.canvas) {
      return
    }

    this.brushPreview.opacity = 0
    try {
      this.canvas.renderAll()
    } catch (err) {
      console.log(`An oopsie happened!`)
    }
  }, 500)

  onMouseMove = (event: fabric.IEvent<Event>) => {
    if (!this.canvas || !this.brushPreview) {
      return
    }

    const pointer = this.canvas.getPointer(event.e)
    this.brushPreview.left = pointer.x
    this.brushPreview.top = pointer.y
    this.brushPreview.opacity = 0.5

    if (this.erasing && this.isMouseDown) {
      this.brushPreview.set('fill', '')
    } else if (this.erasing) {
      this.brushPreview.set('fill', 'red')
      this.updateBrush({ color: 'red' })
    } else {
      this.brushPreview.set('fill', 'white')
      this.updateBrush({ color: 'white' })
    }

    this.brushPreview.set('radius', this.brushSettings.width / 2)
    this.debounceBrushPreview()
    this.updateCanvas()
  }

  clonePath = async (newPath: any, undoAction: boolean = false) => {
    if (!this.canvas || !this.drawLayer || !this.maskLayer) {
      return
    }

    if (!undoAction && this.erasing) {
      newPath.erasing = true
    }

    newPath.path.selectable = false
    newPath.path.opacity = 1

    newPath.maskPath = (await CreateCanvas.asyncClone(
      newPath.path
    )) as fabric.Path
    newPath.drawPath = (await CreateCanvas.asyncClone(
      newPath.path
    )) as fabric.Path

    if ((undoAction && newPath.erasing) || (!undoAction && this.erasing)) {
      newPath.drawPath.globalCompositeOperation = 'destination-out'
      newPath.maskPath.stroke =
        this.maskPathColor === 'white' ? 'black' : 'white'
    } else {
      newPath.drawPath.globalCompositeOperation = 'source-over'
      newPath.maskPath.stroke = this.maskPathColor
    }

    this.maskLayer.add(newPath.maskPath)
    this.drawLayer.addWithUpdate(newPath.drawPath)
    this.canvas.remove(newPath.path)
    this.updateCanvas()
  }

  onPathCreated = async (e: any) => {
    const path = { path: e.path }

    await this.clonePath(path)

    this.undoHistory.push(path)
    this.redoHistory = []
    this.historyIndex = -1

    this.autoSave()
  }

  saveToDisk = async ({ inverted = true }: { inverted?: boolean } = {}) => {
    if (!this.canvas) {
      return
    }

    const data = {
      image: '',
      mask: ''
    }
    if (this.imageLayer) {
      data.image = this.imageLayer.toDataURL({ format: 'webp' }).split(',')[1]
      this.download(this.imageLayer.toDataURL({ format: 'webp' }), 'image')
    }

    if (this.canvas) {
      this.download(this.canvas.toDataURL({ format: 'webp' }), 'canvas')
    }

    if (this.maskLayer) {
      if (inverted) {
        // @ts-ignore
        const inverted: fabric.Canvas = await CreateCanvas.invert(
          this.maskLayer.toDataURL({ format: 'webp' })
        )
        this.download(inverted.toDataURL({ format: 'webp' }), 'mask')
      } else {
        data.mask = this.canvas.toDataURL({ format: 'webp' }).split(',')[1]
        this.download(this.maskLayer.toDataURL({ format: 'webp' }), 'mask')
      }
    }

    return data
  }

  undo = () => {
    if (!this.canvas) {
      return
    }

    if (this.undoHistory.length > 0) {
      const path = this.undoHistory.pop()
      this.redoHistory.push(path)
      this.drawLayer.remove(path.drawPath)
      this.maskLayer?.remove(path.maskPath)

      this.updateCanvas()

      this.historyIndex -= 1
    }
  }

  redo = () => {
    if (!this.canvas) {
      return
    }

    if (this.redoHistory.length > 0) {
      const path = this.redoHistory.pop()
      this.undoHistory.push(path)
      this.clonePath(path, true)
    }
  }

  unload() {
    if (!this.canvas) {
      return
    }

    document.removeEventListener('keyup', this.handleKeyInput)
    // this.canvas.dispose()
  }

  updateBrush = ({
    color,
    width
  }: {
    color?: string
    width?: number
  } = {}) => {
    if (!this.canvas) {
      return
    }

    if (width) {
      this.brushSettings.width = width
    }

    if (color) {
      this.brushSettings.color = color
    }

    this.canvas.freeDrawingCursor = 'crosshair'
    const brush = this.canvas.freeDrawingBrush
    brush.color = this.brushSettings.color
    brush.width = this.brushSettings.width

    if (this.brushPreview) {
      this.brushPreview.set('radius', this.brushSettings.width / 2)
    }

    this.updateCanvas()
  }

  updateCanvas() {
    if (!this.canvas) {
      return
    }

    this.canvas.renderAll()
  }
}

export default CreateCanvas
