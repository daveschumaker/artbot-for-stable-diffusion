import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

import { lockScroll, unlockScroll } from '../../../../utils/appUtils'
import DeleteConfirmModal from '../../../DeleteConfirmModal'
import AdjustmentIcon from '../../../icons/AdjustmentIcon'
import EraserIcon from '../../../icons/EraserIcon'
import MinusVertical from '../../../icons/MinusVertical'
import PencilIcon from '../../../icons/PencilIcon'
import RedoIcon from '../../../icons/RedoIcon'
import TrashIcon from '../../../icons/TrashIcon'
import UndoIcon from '../../../icons/UndoIcon'
import CreateCanvas from '../../../../models/CreateCanvas'
import MenuIcon from '../../../icons/MenuIcon'
import DropDown from './DropDown'
import DropDownItem from './DropDownItem'
import DownloadIcon from '../../../icons/DownloadIcon'
import NewCanvas from './NewCanvas'
import ColorPickerIcon from '../../../icons/ColorPickerIcon'
import CanvasSettings from '../../../../models/CanvasSettings'
import FileIcon from '../../../icons/FileIcon'
import {
  setBase64FromDraw,
  setI2iUploaded
} from '../../../../store/canvasStore'
import UploadIcon from '../../../icons/UploadIcon'
import { useRouter } from 'next/router'
import UploadImage from './UploadImage'

const ToolBarButton = ({
  active,
  btnType,
  children,
  onClick = () => {}
}: any) => {
  const classes = [
    ,
    `border-[1px]`,
    `border-[#ffffff]`,
    `p-[4px]`,
    `rounded-[4px]`,
    `active:border-[1px]`,
    'select-none'
  ]

  if (active) {
    classes.push(`bg-[#6AB7C6]`)
    classes.push(`active:bg-[#8fc9d4]`)
  }
  if (btnType === 'secondary') {
    classes.push('hover:bg-[#fce9e9]')
    classes.push(`active:border-[#6AB7C6]`)
    classes.push(`active:bg-[#fce9e9]`)
  } else {
    classes.push('hover:bg-[#f3f3f3]')
    classes.push(`active:border-[#6AB7C6]`)
    classes.push(`active:bg-[#f3f3f3]`)
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
  handleNewCanvas,
  handleRemoveClick
}: {
  canvas: CreateCanvas
  canvasType?: string
  handleNewCanvas: any
  handleRemoveClick(): void
  source_image?: string
  source_image_height?: number
  source_image_width?: number
}) => {
  const router = useRouter()
  const [activeBrush, setActiveBrush] = useState('paint')
  const [showAdjustmentMenu, setShowAdjustmentMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brushSize, setBrushSize] = useState(20)

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

  const wrapperClasses = [
    'flex',
    'flex-row',
    'items-center',
    'bg-[#ffffff]',
    `rounded-[4px]`,
    'relative',
    'mb-[8px]',
    'md:mb-[16px]',
    'md:gap-[4px]',
    'justify-between',
    'p-[2px]',
    'md:p-[8px]',
    'shadow-md',
    'select-none'
  ]

  return (
    <div className={clsx(wrapperClasses)}>
      <div className="flex flex-row gap-1 items-center">
        {canvasType === 'drawing' && (
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
        <ToolBarButton
          active={activeBrush === 'paint'}
          onClick={() => {
            setActiveBrush('paint')
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
                  unlockScroll()
                  setShowColors(false)
                } else {
                  lockScroll()
                  setShowColors(true)
                }
              }}
            />
          </>
        )}
        {/* <Button onClick={canvas?.saveToDisk}>
        <DownloadIcon />
        </Button> */}
      </div>
      <div>
        <ToolBarButton
          btnType="secondary"
          onClick={() => {
            lockScroll()
            setShowDeleteModal(true)
          }}
        >
          <TrashIcon stroke="black" />
        </ToolBarButton>
      </div>
      {showMainMenu && (
        <DropDown
          handleClose={() => {
            unlockScroll()
            setShowNewModal(false)
            setShowMainMenu(false)
          }}
        >
          <div className="flex flex-col w-full">
            <DropDownItem
              handleClick={() => {
                lockScroll()

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
                lockScroll()

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
            unlockScroll()
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

            unlockScroll()
            handleRemoveClick()
            setShowDeleteModal(false)
          }}
          closeModal={() => {
            unlockScroll()
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
