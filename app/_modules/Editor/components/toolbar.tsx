import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import { useRouter } from 'next/navigation'

import DeleteConfirmModal from 'components/DeleteConfirmModal'
import AdjustmentIcon from 'components/icons/AdjustmentIcon'
import EraserIcon from 'components/icons/EraserIcon'
import MinusVertical from 'components/icons/MinusVertical'
import PencilIcon from 'components/icons/PencilIcon'
import RedoIcon from 'components/icons/RedoIcon'
import TrashIcon from 'components/icons/TrashIcon'
import UndoIcon from 'components/icons/UndoIcon'
import CreateCanvas from 'components/../models/CreateCanvas'
import MenuIcon from 'components/icons/MenuIcon'
import DropDown from './DropDown'
import DropDownItem from './DropDownItem'
import DownloadIcon from 'components/icons/DownloadIcon'
import NewCanvas from './NewCanvas'
import ColorPickerIcon from 'components/icons/ColorPickerIcon'
import CanvasSettings from 'components/../models/CanvasSettings'
import FileIcon from 'components/icons/FileIcon'
import { setBase64FromDraw, setI2iUploaded } from 'store/canvasStore'
import UploadIcon from 'components/icons/UploadIcon'
import UploadImage from './UploadImage'
import { Button } from 'components/UI/Button'
import RulerIcon from 'components/icons/RulerIcon'
import PointerIcon from 'components/icons/PointerIcon'
import useLockedBody from 'hooks/useLockedBody'
import styles from './toolbar.module.css'

const DEBUG_MODE = false
const DISABLE_OUTPAINTING = true

const ToolBarButton = ({ active, btnType, onClick, children }: any) => {
  const classes = [
    styles.border,
    styles.borderWhite,
    styles.p4,
    styles.rounded4,
    styles.activeBorder,
    styles.selectNone
  ]

  if (btnType === 'secondary') {
    classes.push(styles.bgSecondaryHover)
    classes.push(styles.activeBorder) // Repeated, but that's what your original code did
    classes.push(styles.bgSecondaryHover) // Repeated, but that's what your original code did
  } else {
    classes.push(styles.bgDefaultHover)
    classes.push(styles.activeBorder) // Repeated, but that's what your original code did
    classes.push(styles.bgDefaultHover) // Repeated, but that's what your original code did
  }

  if (active) {
    classes.push(styles.bgActive)
    classes.push(styles.activeBg)
  }

  return (
    <button className={clsx(classes)} onClick={onClick}>
      {children}
    </button>
  )
}

const ToolBar = ({
  canvas,
  canvasType = 'inpainting',
  toolbarClassName = '',
  toolbarAbsolute = false,
  toolbarDisableMenu = false,
  handleNewCanvas,
  handleRemoveClick
}: {
  canvas: CreateCanvas
  canvasType?: string
  toolbarClassName?: string
  handleNewCanvas: any
  handleRemoveClick(): void
  source_image?: string
  source_image_height?: number
  source_image_width?: number
  toolbarAbsolute?: boolean
  toolbarDisableMenu?: boolean
}) => {
  const [, setLocked] = useLockedBody(false)
  const router = useRouter()

  const [activeBrush, setActiveBrush] = useState('paint')
  const [showAdjustmentMenu, setShowAdjustmentMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brushSize, setBrushSize] = useState(20)

  const [showScaleMenu, setShowScaleMenu] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)

  const [showNewModal, setShowNewModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showMainMenu, setShowMainMenu] = useState(false)

  const [color, setColor] = useState('#000000')
  const [showColors, setShowColors] = useState(false)

  const handleNewCanvasClick = ({
    height,
    width,
    bgColor
  }: {
    height: number
    width: number
    bgColor: string
  }) => {
    // let container = document.querySelector('#canvas-wrapper')
    // // @ts-ignore
    // const maxWidth = container?.offsetWidth || 512
    // const getHeight = nearestWholeMultiple(
    //   Math.floor((maxWidth * height) / width),
    //   64
    // )
    // let normalizeWidth = nearestWholeMultiple(maxWidth, 64)

    // if (normalizeWidth >= maxWidth) {
    //   normalizeWidth -= 64
    // }

    handleNewCanvas(height, width, bgColor)
    setShowMainMenu(false)
    setShowNewModal(false)
  }

  const handleUploadImage = (data: any) => {
    const newBase64String = `data:${data.imageType};base64,${data.source_image}`

    setI2iUploaded({
      base64String: newBase64String,
      height: data.height,
      width: data.width
    })

    canvas.importImage()
    setShowMainMenu(false)
    setShowUploadModal(false)
  }

  const handleWidth = (e: any) => {
    CanvasSettings.set('brushSize', e.target.value)
    setBrushSize(Number(e.target.value))
    canvas?.updateBrush({ width: Number(e.target.value) })
  }

  useEffect(() => {
    setBrushSize(CanvasSettings.get('brushSize') || 20)
    setColor(CanvasSettings.get('brushColor') || '#000000')
  }, [])

  return (
    <div
      className={clsx(
        styles.toolbar,
        toolbarAbsolute && styles.toolbarAbsolute,
        toolbarClassName
      )}
    >
      <div className="flex flex-row items-center gap-1">
        {canvasType === 'inpainting' && !DISABLE_OUTPAINTING && (
          <ToolBarButton
            active={showScaleMenu}
            onClick={() => {
              setShowScaleMenu(!showScaleMenu)
            }}
          >
            <RulerIcon stroke="black" />
          </ToolBarButton>
        )}
        {canvasType === 'drawing' && !toolbarDisableMenu && (
          <>
            <ToolBarButton
              active={showMainMenu}
              onClick={() => {
                if (showMainMenu) {
                  setShowMainMenu(false)
                } else {
                  setShowMainMenu(true)
                }
              }}
            >
              <MenuIcon stroke="black" />
            </ToolBarButton>
            <MinusVertical stroke="#949494" />
          </>
        )}
        {!DISABLE_OUTPAINTING && (
          <ToolBarButton
            active={activeBrush === 'pointer'}
            onClick={() => {
              setActiveBrush('pointer')
              canvas?.setDrawingMode(false)
            }}
          >
            <PointerIcon stroke="black" />
          </ToolBarButton>
        )}
        <ToolBarButton
          active={activeBrush === 'paint'}
          onClick={() => {
            setActiveBrush('paint')
            canvas?.setDrawingMode(true)
            canvas?.toggleErase(false)
            canvas?.updateBrush()
          }}
        >
          <PencilIcon stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          active={activeBrush === 'erase'}
          onClick={() => {
            setActiveBrush('erase')
            canvas?.setDrawingMode(true)
            canvas?.toggleErase(true)
          }}
        >
          <EraserIcon stroke="black" />
        </ToolBarButton>
        <MinusVertical stroke="#949494" />
        <ToolBarButton onClick={canvas?.undo}>
          <UndoIcon stroke="black" />
        </ToolBarButton>
        <ToolBarButton onClick={canvas?.redo}>
          <RedoIcon stroke="black" />
        </ToolBarButton>
        <MinusVertical stroke="#949494" />
        <ToolBarButton
          active={showAdjustmentMenu}
          onClick={() => {
            if (showAdjustmentMenu) {
              setShowAdjustmentMenu(false)
            } else {
              setShowAdjustmentMenu(true)
            }
          }}
        >
          <AdjustmentIcon stroke="black" />
        </ToolBarButton>
        {canvasType === 'drawing' && (
          <>
            <ToolBarButton
              active={activeBrush === 'picker'}
              onClick={() => {
                if (activeBrush !== 'picker') {
                  setActiveBrush('picker')
                  canvas?.setDrawingMode(true)
                  canvas.colorPicker(true, (colorString: string) => {
                    CanvasSettings.set('brushColor', colorString)
                    setColor(colorString)
                    setActiveBrush('paint')
                    canvas?.toggleErase(false)
                    canvas?.colorPicker(false)
                    canvas?.updateBrush({ color: colorString })
                  })
                } else {
                  canvas.colorPicker(false)
                  setActiveBrush('paint')
                }
              }}
            >
              <ColorPickerIcon stroke="black" />
            </ToolBarButton>
            <div
              className="w-6 h-6 border-[1px] border-slate-500 cursor-pointer rounded-full "
              style={{ backgroundColor: color }}
              onClick={() => {
                if (showColors) {
                  setLocked(false)
                  setShowColors(false)
                } else {
                  setLocked(true)
                  setShowColors(true)
                }
              }}
            />
          </>
        )}
        {DEBUG_MODE && (
          <Button onClick={canvas?.saveToDisk}>
            <DownloadIcon />
          </Button>
        )}
      </div>
      <div>
        <ToolBarButton
          theme="secondary"
          onClick={() => {
            setLocked(true)
            setShowDeleteModal(true)
          }}
        >
          <TrashIcon stroke="black" />
        </ToolBarButton>
      </div>
      {showMainMenu && (
        <DropDown
          handleClose={() => {
            setLocked(false)
            setShowNewModal(false)
            setShowMainMenu(false)
          }}
        >
          <div className="flex flex-col w-full">
            <DropDownItem
              handleClick={() => {
                setLocked(true)

                if (showNewModal) {
                  setShowNewModal(false)
                } else {
                  setShowNewModal(true)
                }
              }}
            >
              <FileIcon size={20} />
              New canvas...
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                setLocked(true)

                if (showUploadModal) {
                  setShowUploadModal(false)
                } else {
                  setShowUploadModal(true)
                }
              }}
            >
              <UploadIcon size={20} />
              Upload image
            </DropDownItem>
            <div className="w-full pt-[4px] mb-[4px] border-b-[1px] border-b-slate-300 h-[3px] flex flex-row" />
            <DropDownItem
              handleClick={() => {
                const data: { base64: string; height: number; width: number } =
                  canvas.exportToDataUrl()
                const { base64 = '', height = 512, width = 512 } = data

                setBase64FromDraw({
                  base64,
                  height,
                  width
                })
                router.push('/controlnet?drawing=true')
              }}
            >
              <UploadIcon size={20} />
              Use for ControlNet
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                const data: { base64: string; height: number; width: number } =
                  canvas.exportToDataUrl()
                const { base64 = '', height = 512, width = 512 } = data

                setBase64FromDraw({
                  base64,
                  height,
                  width
                })
                router.push('/?drawing=true')
              }}
            >
              <UploadIcon size={20} />
              Use for img2img
            </DropDownItem>
            <div className="w-full pt-[4px] mb-[4px] border-b-[1px] border-b-slate-300 h-[3px] flex flex-row" />
            <DropDownItem
              handleClick={() => {
                canvas.saveToDisk()
              }}
            >
              <DownloadIcon size={20} />
              Download
            </DropDownItem>
            {/* <DropDownItem
              handleClick={() => {
                if (
                  !source_image ||
                  !source_image_height ||
                  !source_image_width
                ) {
                  return
                }

                const newBase64String = `data:image/webp;base64,${source_image}`

                setI2iUploaded({
                  base64String: newBase64String,
                  height: source_image_height,
                  width: source_image_width
                })

                setShowMainMenu(false)
                canvas.importImage()
              }}
            >
              <PhotoCheck size={20} />
              Import img2img
            </DropDownItem> */}
          </div>
        </DropDown>
      )}
      {showColors && (
        <DropDown
          handleClose={() => {
            setLocked(false)
            setShowColors(false)
          }}
        >
          <HexAlphaColorPicker
            color={color}
            onChange={(value: string) => {
              CanvasSettings.set('brushColor', value)
              setColor(value)
              setActiveBrush('paint')
              canvas?.toggleErase(false)
              canvas?.updateBrush({ color: value })
            }}
          />
        </DropDown>
      )}
      {showScaleMenu && (
        <DropDown handleClose={() => setShowScaleMenu(false)}>
          <div className="flex flex-col w-full">
            <div className="w-full mb-2">
              <div className="text-gray-900">
                <small>
                  <strong>Canvas scale ({canvasScale})</strong>
                </small>
              </div>
              <div className="w-full">
                <input
                  className="w-full"
                  type="range"
                  min={0.2}
                  max={1.2}
                  step={0.1}
                  onChange={(e: any) => {
                    canvas?.scale(Number(e.target.value))
                    setCanvasScale(e.target.value)
                  }}
                  value={canvasScale}
                />
              </div>
            </div>
          </div>
        </DropDown>
      )}
      {showAdjustmentMenu && (
        <DropDown handleClose={() => setShowAdjustmentMenu(false)}>
          <div className="flex flex-col w-full">
            <div className="w-full mb-2">
              <div className="text-gray-900">
                <small>
                  <strong>Brush size ({brushSize} px)</strong>
                </small>
              </div>
              <div className="w-full">
                <input
                  className="w-full"
                  type="range"
                  min={canvasType === 'drawing' ? 2 : 10}
                  max="120"
                  onChange={handleWidth}
                  value={brushSize}
                />
              </div>
            </div>
          </div>
        </DropDown>
      )}
      {showUploadModal && (
        <UploadImage
          handleSaveImage={handleUploadImage}
          handleClose={() => {
            setShowUploadModal(false)
          }}
        />
      )}
      {showNewModal && (
        <NewCanvas
          handleOnCreateClick={handleNewCanvasClick}
          handleClose={() => {
            setShowNewModal(false)
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirmClick={() => {
            if (canvasType === 'drawing') {
              canvas?.reset()
            }

            setLocked(false)
            handleRemoveClick()
            setShowDeleteModal(false)
          }}
          closeModal={() => {
            setLocked(false)
            setShowDeleteModal(false)
          }}
        >
          <h3
            className="text-lg font-medium leading-6 text-gray-900"
            id="modal-title"
          >
            Remove image{canvasType !== 'drawing' ? ' and mask?' : '?'}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to remove this image
              {canvasType !== 'drawing' ? ' and mask?' : '?'}{' '}
              {canvasType !== 'drawing' ? 'They' : 'It'} will be erased. This
              action cannot be undone.
            </p>
          </div>
        </DeleteConfirmModal>
      )}
    </div>
  )
}

export default ToolBar
