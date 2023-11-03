import clsx from 'clsx'
import { useCallback, useState } from 'react'

import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import useLockedBody from 'app/_hooks/useLockedBody'
import styles from './toolbar.module.css'
import {
  IconAdjustments,
  IconArrowBackUp,
  IconArrowDown,
  IconArrowForwardUp,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconEraser,
  IconHelpCircle,
  IconMinusVertical,
  IconPencil,
  IconSettings,
  IconTrash
} from '@tabler/icons-react'
import InpaintingCanvas from 'app/_data-models/InpaintingCanvas'
import { useInput } from 'app/_modules/InputProvider/context'
import { SourceProcessing } from '_types/horde'
import AdjustmentMenu from './AdjustmentMenu'
import SettingMenu from './SettingsMenu'
import HelpfulTipModal from 'app/_modules/HelpfulTipModal'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'

const removeImageCanvasData = {
  canvasData: null,
  maskData: null,
  imageType: '',
  source_image: '',
  source_mask: '',
  source_processing: SourceProcessing.Prompt
}

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
    <button
      className={clsx(classes)}
      onClick={onClick}
      style={{ color: 'black' }}
    >
      {children}
    </button>
  )
}

const ToolBar = ({ canvas }: { canvas: InpaintingCanvas }) => {
  const { input, setInput } = useInput()
  const [, setLocked] = useLockedBody(false)

  const [activeBrush, setActiveBrush] = useState('paint')
  const [showAdjustmentMenu, setShowAdjustmentMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brushSize, setBrushSize] = useState(20)

  const [showTipsModal, setShowTipsModal] = useState(false)
  const [showSettingMenu, setShowSettingMenu] = useState(false)
  const [showOutpaintToolbar, setShowOutpaintToolbar] = useState(false)

  const handleRemoveClick = async () => {
    await PromptInputSettings.updateSavedInput_NON_DEBOUNCED({
      ...input,
      ...removeImageCanvasData
    })
    setInput({ ...removeImageCanvasData })
  }

  const handleAdjustCanvasSize = useCallback(
    (direction: 'top' | 'bottom' | 'left' | 'right', pixels: number = 64) => {
      if (direction === 'top' || direction === 'bottom') {
        setInput({
          height: input.height + pixels
        })
      }

      if (direction === 'left' || direction === 'right') {
        setInput({
          width: input.width + pixels
        })
      }
    },
    [input.height, input.width, setInput]
  )

  const handleWidth = (e: any) => {
    setBrushSize(Number(e.target.value))
    canvas?.setBrushSize(Number(e.target.value))
  }

  return (
    <>
      <div className={clsx(styles.toolbar)}>
        <div className="flex flex-row items-center gap-1">
          <ToolBarButton
            active={showSettingMenu}
            onClick={() => {
              if (showSettingMenu) {
                setShowSettingMenu(false)
              } else {
                setShowSettingMenu(true)
              }
            }}
          >
            <IconSettings stroke="black" />
          </ToolBarButton>
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
            <IconAdjustments stroke="black" />
          </ToolBarButton>
          <IconMinusVertical stroke="#949494" />

          <ToolBarButton
            active={activeBrush === 'paint'}
            onClick={() => {
              setActiveBrush('paint')
              canvas?.toggleErase(false)
            }}
          >
            <IconPencil stroke="black" />
          </ToolBarButton>
          <ToolBarButton
            active={activeBrush === 'erase'}
            onClick={() => {
              setActiveBrush('erase')
              canvas?.toggleErase(true)
            }}
          >
            <IconEraser stroke="black" />
          </ToolBarButton>
          <IconMinusVertical stroke="#949494" />
          <ToolBarButton onClick={canvas?.undo}>
            <IconArrowBackUp stroke="black" />
          </ToolBarButton>
          <ToolBarButton onClick={canvas?.redo}>
            <IconArrowForwardUp stroke="black" />
          </ToolBarButton>
        </div>
        <div>
          <ToolBarButton
            theme="secondary"
            onClick={() => {
              setLocked(true)
              setShowDeleteModal(true)
            }}
          >
            <IconTrash stroke="black" />
          </ToolBarButton>
        </div>
        {showSettingMenu && (
          <SettingMenu
            handleClearMask={canvas?.clearMaskCanvas}
            handleDownloadClick={canvas?.saveToDisk}
            setShowOutpaintToolbar={setShowOutpaintToolbar}
            setShowSettingMenu={setShowSettingMenu}
            showOutpaintToolbar={showOutpaintToolbar}
          />
        )}
        {showAdjustmentMenu && (
          <AdjustmentMenu
            setShowAdjustmentMenu={setShowAdjustmentMenu}
            brushSize={brushSize}
            handleWidth={handleWidth}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmModal
            onConfirmClick={() => {
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
              Remove image and mask?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to remove this image and mask? They will
                be erased. This action cannot be undone.
              </p>
            </div>
          </DeleteConfirmModal>
        )}
        {showTipsModal && (
          <HelpfulTipModal
            onConfirmClick={() => {
              setLocked(false)
              handleRemoveClick()
              setShowTipsModal(false)
            }}
            closeModal={() => {
              setLocked(false)
              setShowTipsModal(false)
            }}
          >
            <h3
              className="text-lg font-medium leading-6 text-gray-900"
              id="modal-title"
            >
              Outpainting tips
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 pb-2">
                General tips to help improve your outpainting results.
              </p>
              <p className="text-sm text-gray-500">
                <ul>
                  <li>
                    • ArtBot will automatically mask expanded areas and fill
                    with average color of image.
                  </li>
                  <li>• Outpaint in a single direction</li>
                  <li>• Use a high step count (50 - 75)</li>
                  <li>• Prompt matches source image</li>
                  <li>• Denoise slider to max (1.0)</li>
                  <li>• Low guidance (2 - 8)</li>
                </ul>
              </p>
            </div>
          </HelpfulTipModal>
        )}
      </div>
      {showOutpaintToolbar && (
        <>
          <div style={{ paddingTop: '2px', fontWeight: 700, fontSize: 14 }}>
            Outpainting Utils
          </div>
          <div className={clsx(styles.toolbar)}>
            <div className="flex flex-row items-center gap-1">
              <ToolBarButton
                onClick={() => {
                  setShowTipsModal(true)
                }}
              >
                <IconHelpCircle stroke="black" />
              </ToolBarButton>
              <IconMinusVertical stroke="#949494" />
              <ToolBarButton
                onClick={() => {
                  canvas?.expandCanvas('bottom', 64)
                  handleAdjustCanvasSize('bottom', 64)
                }}
              >
                <IconArrowDown stroke="black" />
              </ToolBarButton>
              <ToolBarButton
                onClick={() => {
                  canvas?.expandCanvas('top', 64)
                  handleAdjustCanvasSize('top', 64)
                }}
              >
                <IconArrowUp stroke="black" />
              </ToolBarButton>
              <ToolBarButton
                onClick={() => {
                  canvas?.expandCanvas('right', 64)
                  handleAdjustCanvasSize('right', 64)
                }}
              >
                {/* <IconArrowUp stroke="black" /> */}
                <IconArrowRight stroke="black" />
              </ToolBarButton>
              <ToolBarButton
                onClick={() => {
                  canvas?.expandCanvas('left', 64)
                  handleAdjustCanvasSize('left', 64)
                }}
              >
                <IconArrowLeft stroke="black" />
              </ToolBarButton>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ToolBar
