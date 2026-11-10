import { basePath } from 'BASE_PATH'
import {
  Canvas,
  Circle,
  Color,
  FabricImage,
  FabricObject,
  Group,
  Path,
  Pattern,
  PencilBrush,
  Rect,
  TPointerEventInfo,
  config,
  filters,
  util
} from 'fabric'
import {
  getCanvasStore,
  getI2IString,
  getSavedDrawingState,
  getSavedHistoryState,
  saveDrawingState,
  saveHistoryState,
  storeCanvas
} from 'app/_store/canvasStore'
import { debounce } from 'app/_utils/debounce'
import { getCanvasHeight, getMaxValidCanvasWidth } from 'app/_utils/fabricUtils'
import { nearestWholeMultiple } from 'app/_utils/imageUtils'
import { SourceProcessing } from 'app/_utils/promptUtils'
import CanvasSettings from './CanvasSettings'

config.configure({ NUM_FRACTION_DIGITS: 15 })

// Fabric 7 positions objects by their center by default. This code relies on
// left and top being the top-left corner.
FabricObject.ownDefaults.originX = 'left'
FabricObject.ownDefaults.originY = 'top'

export let hoveredColor: string = '#ffffff'

interface IParams {
  bgColor: string
  // CreateCanvas.init returns undefined if fabric fails to create the canvas.
  canvas: Canvas | undefined
  canvasId?: string
  canvasType?: string
  height?: number
  width?: number
  setInput: (data: any) => void
}

class CreateCanvas {
  bgColor: string
  canvas: Canvas | null | undefined
  canvasType: string
  brushPreview: Circle | null
  brushSettings: {
    color: string
    eraseColor: string
    opacity: number
    width: number
  }
  canvasId: string
  canvasScale: number
  drawLayer: Group
  imageLayer: Group | null
  isMouseDown: boolean
  erasing: boolean
  height: number
  historyProcessing: boolean
  redoHistory: Array<any>
  undoHistory: Array<any>
  historyIndex: number
  maskLayer: Canvas | null
  setInput: (data: any) => void
  width: number
  maskPathColor: string
  maskBackgroundColor: string
  isPickingColor: boolean
  colorPickerCallback: (value: string) => void

  constructor({
    bgColor = '#ffffff',
    canvas,
    canvasId = 'canvas',
    canvasType = 'inpainting',
    setInput = () => {},
    height = 512,
    width = 512
  }: IParams) {
    this.bgColor = bgColor
    this.setInput = setInput
    this.canvas = canvas
    this.canvasId = String(canvasId)
    this.canvasType = String(canvasType)
    this.canvasScale = 1
    this.brushPreview = null
    this.drawLayer = this.makeNewLayer({})
    this.imageLayer = null
    this.maskLayer = null
    this.height = Number(height)
    this.width = Number(width)

    this.brushSettings = {
      opacity: 1,
      width: 20,
      color: canvasType === 'inpainting' ? 'white' : 'black',
      eraseColor: canvasType === 'inpainting' ? 'red' : 'white'
    }

    this.maskPathColor = 'white'
    this.maskBackgroundColor = 'black'

    this.erasing = false

    this.undoHistory = []
    this.redoHistory = []
    this.historyIndex = -1

    document.addEventListener('keyup', this.handleKeyInput)

    this.historyProcessing = false

    this.isMouseDown = false

    this.isPickingColor = false
    this.colorPickerCallback = () => {}
  }

  static asyncClone = (object: any): Promise<any> => object.clone()

  static init = ({
    bgColor = 'white',
    height = 512,
    canvasId = 'canvas'
  }: {
    bgColor?: string
    height?: number
    width?: number
    canvasId?: string
  } = {}) => {
    try {
      const canvas = new Canvas(canvasId, {
        backgroundColor: bgColor,
        // renderOnAddRemove: true,
        isDrawingMode: false,
        height,
        width: getMaxValidCanvasWidth()
      })

      // Fabric no longer creates a default brush.
      canvas.freeDrawingBrush = new PencilBrush(canvas)

      return canvas
    } catch (e) {
      console.log(`e?`, e)
    }
  }

  restoreCanvas = () => {
    if (!this.canvas) {
      return
    }

    // The saved drawing state only changes through saveDrawingState and
    // resetSavedDrawingState, neither of which runs during this block, so one
    // read is equivalent to re-reading it for every field.
    const savedDrawing =
      this.canvasType === 'drawing' ? getSavedDrawingState() : false

    if (savedDrawing) {
      this.undoHistory = [...getSavedHistoryState().undo]
      this.redoHistory = [...getSavedHistoryState().redo]

      this.height = savedDrawing.canvasHeight
      this.width = savedDrawing.canvasWidth

      this.canvas.remove(this.drawLayer)
      this.drawLayer = savedDrawing.savedDrawingState
      this.canvas.add(this.drawLayer)

      this.canvas.setDimensions({
        height: savedDrawing.canvasHeight,
        width: savedDrawing.canvasWidth
      })

      if (savedDrawing.savedDrawingBaseImage) {
        this.imageLayer = savedDrawing.savedDrawingBaseImage

        if (this.imageLayer) {
          this.canvas.insertAt(0, this.imageLayer)
        }
      }

      this.canvas.isDrawingMode = true
      this.updateCanvas()
      return
    }

    this.canvas.clear()
    const { height, width } = getCanvasStore()
    this.height = height
    this.width = width
    this.canvas.setDimensions({ height: height, width: width })

    this.canvas.loadFromJSON(getCanvasStore().drawLayer).then(() => {
      if (!this.canvas) {
        return
      }

      const objects = this.canvas.getObjects()

      // The saved JSON is built by this class: index 1 is the draw layer group
      // and index 2 is the brush preview circle.
      this.drawLayer = objects[1] as Group
      this.brushPreview = objects[2] as Circle

      if (getCanvasStore().maskLayer) {
        this.createMaskLayer()
        this.maskLayer?.loadFromJSON(getCanvasStore().maskLayer).then(() => {
          if (!this.maskLayer) {
            return
          }

          this.maskLayer.setDimensions({
            height: this.height,
            width: this.width
          })

          this.setInput({
            source_mask: this.maskLayer
              .toDataURL({ format: 'webp', multiplier: 1 })
              .split(',')[1]
          })

          this.maskLayer.renderAll()
        })
      }

      this.canvas.isDrawingMode = true
      this.updateCanvas()
    })
  }

  static invert = async (
    base64String: string,
    returnString: boolean = false
  ): Promise<Canvas | string> => {
    return new Promise((resolve) => {
      FabricImage.fromURL(base64String).then((image) => {
        if (!image) {
          return
        }
        image.filters.push(new filters.Invert())

        // Main filter
        // image.filters.push(new fabric.Image.filters.BlackWhite())

        // // Remove minor gray tones ( #000, #FFF only )
        // //@ts-ignore
        // image.filters.push(new fabric.Image.filters.Grayscale())

        // // Set contrast to max value
        // //@ts-ignore
        // image.filters.push(new fabric.Image.filters.Contrast({ contrast: 1 }))

        const invertedCanvas = new Canvas(undefined, {
          height: image.height,
          width: image.width
        })

        invertedCanvas.add(image)
        image.applyFilters()
        invertedCanvas.renderAll()

        if (returnString) {
          const dataString = invertedCanvas
            .toDataURL({ format: 'webp', multiplier: 1 })
            .split(',')[1]
          resolve(dataString)
        } else {
          resolve(invertedCanvas)
        }
      })
    })
  }

  initBrushPreview = () => {
    if (!this.canvas) {
      return
    }

    this.brushPreview = new Circle({
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

    const objects = this.canvas.getObjects()
    this.canvas?.insertAt(objects.length, this.brushPreview)

    // this.canvas?.add(this.brushPreview)
  }

  initDrawing = () => {
    if (!this.canvas) {
      return
    }

    this.canvas.setDimensions({ height: this.height, width: this.width })

    // Cloning initPaint behavior
    this.canvas.isDrawingMode = true
    this.createDrawLayer({ opacity: 1.0 })

    this.canvas.add(this.drawLayer)
    this.initBrushPreview()
    this.updateBrush()
    this.initCanvasEvents()
    this.updateCanvas()

    this.updateBrush({
      color: CanvasSettings.get('brushColor') || '#000000',
      width: CanvasSettings.get('brushSize') || 20
    })
  }

  initInpainting = () => {
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

    const bgUrl = `${basePath}/checkerboard.png`
    util.loadImage(bgUrl).then((source) => {
      if (!this.canvas) {
        return
      }

      this.canvas.backgroundColor = new Pattern({ source, repeat: 'repeat' })
      this.canvas.renderAll()
    })

    this.updateBrush({
      width: CanvasSettings.get('brushSize') || 20
    })
  }

  initCanvasEvents = () => {
    if (!this.canvas) {
      return
    }

    const handleMouseMove = (e: any) => {
      this.onMouseMove(e)
      this.getColorFromCanvas(e)
    }

    const handleMouseDown = () => {
      if (!this.brushPreview) {
        return
      }

      this.isMouseDown = true
      this.brushPreview.set('strokeWidth', 0)
      this.brushPreview.set('stroke', '')
    }

    const handleMouseUp = () => {
      if (!this.brushPreview) {
        return
      }

      this.isMouseDown = false
      this.brushPreview.set('strokeWidth', 1)
      this.brushPreview.set('stroke', 'black')

      if (this.isPickingColor) {
        this.colorPickerCallback(hoveredColor)
      }
    }

    this.canvas.on('path:created', this.onPathCreated)
    this.canvas.on('mouse:move', handleMouseMove)
    this.canvas.on('mouse:down', handleMouseDown)
    this.canvas.on('mouse:up', handleMouseUp)
  }

  exportToDataUrl = () => {
    if (!this.canvas) {
      return {
        base64: '',
        height: 512,
        width: 512
      }
    }

    return {
      base64: this?.canvas
        ?.toDataURL({ format: 'webp', multiplier: 1 })
        .split(',')[1],
      height: this.height,
      width: this.width
    }
  }

  autoSave = () => {
    if (!this.canvas) {
      return
    }

    // Temporarily clone and remove brush layer on autosave so brush outline isn't saved to canvas
    // canvas.remove is a no-op for a null brushPreview.
    if (this.brushPreview) {
      this.canvas.remove(this.brushPreview)
    }

    // TODO: Save imageLayer and maskLayer to image job for later look ups! (And to selectively toggle mask)
    const data = {
      imageType: 'image/webp',
      source_image: '',
      source_mask: '',
      source_processing:
        this.canvasType === 'drawing'
          ? SourceProcessing.Img2Img
          : SourceProcessing.InPainting,
      orientationType: 'custom',

      // H x W are set on initial canvas load. Not sure why I had set this as part of autosave.
      // It ends up overwriting the initial image settings for some reason.
      // e.g., an imported image for inpainting is 896 x 576 and this ends up resizing it to:
      // 512 x
      // height: nearestWholeMultiple(this.canvas.height || 512),
      // width: nearestWholeMultiple(this.canvas.width || 512),
      canvasStore: this.canvas.toJSON(),
      canvasData: this.canvas.toObject(),
      maskData: null
    }

    storeCanvas('drawLayer', data.canvasData)

    if (this.canvasType === 'drawing') {
      let baseImage = this.imageLayer ? this.imageLayer : false

      saveHistoryState({
        undo: [...this.undoHistory],
        redo: [...this.redoHistory]
      })
      saveDrawingState(this.drawLayer, this.height, this.width, baseImage)

      data.source_image = this?.canvas
        ?.toDataURL({ format: 'webp', multiplier: 1 })
        .split(',')[1]
    }

    if (this.imageLayer) {
      // TODO: FIXME: Outpainting support
      // I had switched this call the handle outpainting requests, but it's now breaking inpainting due to merging a mask with source_image.
      // Was trying to get around issue with properly scaling the image on the canvas, but the source_image being attached isn't resized,
      // so the Stable Horde backend wouldn't properly outpaint the image. This following line got around that by essentially creating a whole
      // new image that includes entire canvas + resized image. It's hacky and needs to be fixed. Disabling for now.
      // data.source_image = this?.canvas

      // This works for img2img / img2img mask / inpainting.
      data.source_image = this?.imageLayer
        ?.toDataURL({ format: 'webp', multiplier: 1 })
        .split(',')[1]
    }

    if (this.maskLayer) {
      data.source_mask = this.maskLayer
        .toDataURL({ format: 'webp', multiplier: 1 })
        .split(',')[1]

      data.maskData = this.maskLayer.toObject()
      storeCanvas('maskLayer', data.maskData)
    }

    this.setInput({ ...data })
    this.initBrushPreview()
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

  setDrawingMode = (value: boolean) => {
    if (!this.canvas) {
      return
    }

    this.canvas.isDrawingMode = value
  }

  createDrawLayer({ opacity = 1.0 }: { opacity: number }) {
    this.drawLayer = this.makeNewLayer({
      layerHeight: this.height,
      layerWidth: this.width,
      opacity
    })
  }

  createMaskLayer() {
    this.maskLayer = new Canvas(undefined, {
      backgroundColor: this.maskBackgroundColor,
      isDrawingMode: false
    })

    this.maskLayer.selection = false
    this.maskLayer.setDimensions({ height: this.height, width: this.width })
  }

  download = (base64Data: string, fileName = 'test') => {
    const ext = this.canvasType === 'drawing' ? '.png' : '.webp'
    const linkSource = `${base64Data}`
    const downloadLink = document.createElement('a')
    downloadLink.setAttribute('id', 'temp-download-link')
    downloadLink.href = linkSource
    downloadLink.download = fileName.substring(0, 255) + ext // Only get first 255 characters so we don't break the max file name limit
    downloadLink.click()
    downloadLink.remove()
  }

  clear = () => {
    if (!this.canvas) {
      return
    }

    this.undoHistory = []
    this.redoHistory = []
    this.historyIndex = -1

    this.canvas.remove(this.drawLayer)
    this.canvas.clear()
    this.canvas.remove(...this.canvas.getObjects())
  }

  reset = () => {
    if (!this.canvas) {
      return
    }

    this.undoHistory = []
    this.redoHistory = []
    this.historyIndex = -1

    if (this.canvasType === 'drawing') {
      if (this.imageLayer) {
        this.canvas.remove(this.imageLayer)
        this.imageLayer = null
      }

      this.canvas.remove(this.drawLayer)
      this.createDrawLayer({ opacity: 1.0 })
      this.canvas.add(this.drawLayer)
      this.canvas.isDrawingMode = true
      this.updateCanvas()
    } else {
      this.canvas.clear()
    }
  }

  static getMaskForInput(
    maskLayer: any,
    height: number,
    width: number
  ): Promise<string> {
    return new Promise((resolve) => {
      // No saved mask. Resolves with an empty mask.
      if (!getCanvasStore().maskLayer) {
        return resolve('')
      }

      let newMask = new Canvas(undefined, {
        backgroundColor: 'black',
        isDrawingMode: false
      })

      newMask.loadFromJSON(getCanvasStore().maskLayer).then(() => {
        if (!newMask) {
          return
        }

        newMask.setDimensions({ height: height, width: width })

        resolve(
          newMask.toDataURL({ format: 'webp', multiplier: 1 }).split(',')[1]
        )
      })
    })
  }

  // TODO: Extrapolate a lot of this into static  methods that can be used anywhere.
  importImage() {
    return new Promise((resolve) => {
      if (!this.canvas) {
        return resolve(true)
      }

      const canvas = this.canvas
      const fullDataString = getI2IString().base64String

      FabricImage.fromURL(fullDataString).then((image) => {
        // const innerWidth = window.innerWidth
        // const containerWidth = getPanelWidth(innerWidth)
        const containerWidth = getMaxValidCanvasWidth()
        let newHeight = image.height || 512
        let newWidth = containerWidth

        if (image?.width > containerWidth && image.width >= image.height) {
          newHeight = getCanvasHeight({
            baseHeight: image.height,
            baseWidth: image.width,
            foundWidth: containerWidth
          })

          image.scaleToWidth(containerWidth)
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

        // Finally, we need to ensure that image has dimensions that are divisible by 64
        this.height =
          nearestWholeMultiple(newHeight) > newHeight
            ? nearestWholeMultiple(newHeight) - 64
            : nearestWholeMultiple(newHeight)
        this.width = newWidth

        canvas.setDimensions({ height: this.height, width: this.width })

        this.imageLayer = this.makeNewLayer({
          image,
          layerHeight: this.height,
          layerWidth: this.width
        })

        canvas.insertAt(0, this.imageLayer)

        // Import mask layer, if available, otherwise create mask layer.
        let source_mask = ''
        if (getCanvasStore().maskLayer) {
          this.createMaskLayer()
          this.maskLayer?.loadFromJSON(getCanvasStore().maskLayer).then(() => {
            if (!this.maskLayer) {
              return
            }

            this.maskLayer.setDimensions({
              height: this.height,
              width: this.width
            })

            source_mask = this.maskLayer
              .toDataURL({ format: 'webp', multiplier: 1 })
              .split(',')[1]
          })
        } else {
          this.createMaskLayer()
        }

        this.updateCanvas()

        if (this.maskLayer) {
          this.maskLayer.renderAll()
        }

        // Once image has been properly imported and setup, store all relevant data on input object
        this.setInput({
          height: this.height,
          width: this.width,
          source_image: this?.imageLayer
            ?.toDataURL({ format: 'webp', multiplier: 1 })
            .split(',')[1],
          source_mask
        })

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
      new Rect({
        width: layerWidth,
        height: layerHeight,
        left: 0,
        top: 0,
        fill: fill,
        absolutePositioned: absolute,
        selectable: false
      })

    const newGroup = new Group([newLayer], {
      // selectable: image ? true : false, // Outpainting stuff
      selectable: false,
      absolutePositioned: absolute,
      opacity
    })

    return newGroup
  }

  scale = (value: any) => {
    if (!this.imageLayer || !this.canvas) {
      return
    }

    this.canvasScale = value
    this.imageLayer.scale(parseFloat(value))
    this.imageLayer.setCoords()
    this.canvas.viewportCenterObject(this.imageLayer)
    this.canvas.requestRenderAll()

    this.autoSave()
  }

  toggleErase = (bool: boolean) => {
    this.colorPicker(false)

    if (bool === true) {
      this.erasing = true
      this.updateBrush({ color: this.brushSettings.eraseColor, erasing: true })
    } else if (bool === false) {
      this.erasing = false
      this.updateBrush({ color: this.brushSettings.color })
    } else if (this.erasing) {
      this.erasing = false
      this.updateBrush({ color: this.brushSettings.color })
    } else {
      this.erasing = true
      this.updateBrush({ color: this.brushSettings.eraseColor, erasing: true })
    }
  }

  debounceBrushPreview = debounce(() => {
    if (!this.brushPreview || !this.canvas || this.isPickingColor) {
      return
    }

    this.brushPreview.opacity = 0
    try {
      this.canvas.renderAll()
    } catch (err) {
      console.log(`An oopsie happened!`)
    }
  }, 500)

  onMouseMove = (event: TPointerEventInfo) => {
    if (!this.canvas || !this.brushPreview || !this.canvas.isDrawingMode) {
      return
    }

    const pointer = this.canvas.getScenePoint(event.e)
    this.brushPreview.left = pointer.x
    this.brushPreview.top = pointer.y
    this.brushPreview.opacity = 0.5

    if (this.isPickingColor) {
      this.brushPreview.opacity = 1

      this.brushPreview.set('fill', '')
      this.brushPreview.set('radius', 20)
      this.brushPreview.set('strokeWidth', 10)
      // this.debounceBrushPreview()
      this.updateCanvas()
      return
    }

    if (this.erasing && this.isMouseDown) {
      this.brushPreview.set('fill', '')
    } else if (this.erasing) {
      this.brushPreview.set('fill', 'red')
      this.updateBrush({ color: 'red', erasing: true })
    } else {
      this.brushPreview.set(
        'fill',
        this.canvasType === 'inpainting' ? 'white' : this.brushSettings.color
      )
      this.updateBrush({
        color:
          this.canvasType === 'inpainting' ? 'white' : this.brushSettings.color
      })
    }

    this.brushPreview.set('radius', this.brushSettings.width / 2)
    this.debounceBrushPreview()
    this.updateCanvas()
  }

  clonePath = async (newPath: any, undoAction: boolean = false) => {
    if (!this.canvas || !this.drawLayer) {
      return
    }

    if (!undoAction && this.erasing) {
      newPath.erasing = true
    }

    newPath.path.selectable = false
    newPath.path.opacity = 1

    newPath.drawPath = (await CreateCanvas.asyncClone(newPath.path)) as Path

    if ((undoAction && newPath.erasing) || (!undoAction && this.erasing)) {
      newPath.drawPath.globalCompositeOperation = 'destination-out'
    } else {
      newPath.drawPath.globalCompositeOperation = 'source-over'
    }

    if (this.maskLayer && this.canvasType === 'inpainting') {
      newPath.maskPath = (await CreateCanvas.asyncClone(newPath.path)) as Path

      if ((undoAction && newPath.erasing) || (!undoAction && this.erasing)) {
        newPath.maskPath.stroke =
          this.maskPathColor === 'white' ? 'black' : 'white'
      } else {
        newPath.maskPath.stroke = this.maskPathColor
      }

      this.maskLayer.add(newPath.maskPath)
    }

    this.drawLayer.add(newPath.drawPath)
    this.canvas.remove(newPath.path)
    this.updateCanvas()

    return newPath
  }

  onPathCreated = async (e: any) => {
    if (!this.canvas || this.historyProcessing) {
      return
    }

    const path = { path: e.path }

    const updatedPath = await this.clonePath(path)

    this.undoHistory.push(updatedPath)
    this.redoHistory = []
    this.historyIndex = -1

    this.autoSave()
  }

  saveToDisk = async ({ inverted = false }: { inverted?: boolean } = {}) => {
    if (!this.canvas) {
      return
    }

    if (this.canvasType === 'drawing') {
      this.download(
        this.canvas.toDataURL({ format: 'png', multiplier: 1 }),
        this.canvasId
      )
      return
    }

    const data = {
      image: '',
      mask: ''
    }

    if (this.imageLayer) {
      data.image = this.imageLayer
        .toDataURL({ format: 'webp', multiplier: 1 })
        .split(',')[1]
      this.download(
        this.imageLayer.toDataURL({ format: 'webp', multiplier: 1 }),
        'image'
      )
    }

    if (this.canvas) {
      this.download(
        this.canvas.toDataURL({ format: 'webp', multiplier: 1 }),
        this.canvasId
      )
    }

    if (this.maskLayer) {
      if (inverted) {
        // invert resolves to a Canvas when returnString is not set.
        const inverted = (await CreateCanvas.invert(
          this.maskLayer.toDataURL({ format: 'webp', multiplier: 1 })
        )) as Canvas
        this.download(
          inverted.toDataURL({ format: 'webp', multiplier: 1 }),
          'mask'
        )
      } else {
        data.mask = this.canvas
          .toDataURL({ format: 'webp', multiplier: 1 })
          .split(',')[1]
        this.download(
          this.maskLayer.toDataURL({ format: 'webp', multiplier: 1 }),
          'mask'
        )
      }
    }

    return data
  }

  undo = () => {
    if (!this.canvas) {
      return
    }

    if (this.undoHistory.length > 0) {
      const history = this.undoHistory.pop()
      this.redoHistory.push(history)

      this.drawLayer.remove(history.drawPath)

      if (this.maskLayer) {
        this.maskLayer?.remove(history.maskPath)
      }

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

    this.canvas.off()
  }

  updateBrush = ({
    color,
    erasing = false,
    opacity = 1,
    width
  }: {
    color?: string
    erasing?: boolean
    opacity?: number
    width?: number
  } = {}) => {
    if (!this.canvas) {
      return
    }

    if (width) {
      this.brushSettings.width = width
    }

    if (color && !erasing) {
      this.brushSettings.color = color
    }

    if (opacity && !erasing) {
      this.brushSettings.opacity = opacity
    }

    this.canvas.freeDrawingCursor = 'crosshair'
    const brush = this.canvas.freeDrawingBrush!
    brush.color = erasing
      ? this.brushSettings.eraseColor
      : this.brushSettings.color
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

  colorPicker = (
    enabled: boolean = false,
    callback: (value: string) => void = () => {}
  ) => {
    if (!this.canvas) {
      return
    }

    this.colorPickerCallback = callback

    if (enabled === true) {
      this.isPickingColor = true
      this.canvas.isDrawingMode = false
      this.canvas.selection = false
      this.canvas.hoverCursor = 'crosshair'

      if (this.brushPreview) {
        this.brushPreview.set('fill', '')
        this.brushPreview.set('strokeWidth', 3)
      }
    } else {
      this.isPickingColor = false
      this.canvas.isDrawingMode = true
      this.canvas.selection = false
    }
  }

  getColorFromCanvas = (e: any) => {
    if (!this.canvas || !this.isPickingColor) {
      return
    }

    const canvasContext = this.canvas.getContext()
    const mousePointer = this.canvas.getScenePoint(e.e)
    const x = parseInt(String(mousePointer.x))
    const y = parseInt(String(mousePointer.y))
    // get the color array for the pixel under the mouse
    const pixel = canvasContext.getImageData(x, y, 1, 1).data
    const color = {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      a: pixel[3]
    }

    hoveredColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`

    if (this.brushPreview) {
      this.brushPreview.set('stroke', hoveredColor)
    }

    return new Color(
      `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    ).toHex()
  }
}

export default CreateCanvas
