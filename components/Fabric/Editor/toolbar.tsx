import clsx from 'clsx'
import { useState } from 'react'
import { lockScroll, unlockScroll } from '../../../utils/appUtils'
import DeleteConfirmModal from '../../DeleteConfirmModal'
import AdjustmentIcon from '../../icons/AdjustmentIcon'
import EraserIcon from '../../icons/EraserIcon'
import MinusVertical from '../../icons/MinusVertical'
import PencilIcon from '../../icons/PencilIcon'
import RedoIcon from '../../icons/RedoIcon'
import TrashIcon from '../../icons/TrashIcon'
import UndoIcon from '../../icons/UndoIcon'
import CreateCanvas from '../../../models/CreateCanvas'
import DropDown from './components/DropDown'
// import { Button } from '../../UI/Button'
// import DownloadIcon from '../../icons/DownloadIcon'

const ToolBarButton = ({ active, children, onClick = () => {} }: any) => {
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
  handleRemoveClick
}: {
  canvas: CreateCanvas
  handleRemoveClick(): void
}) => {
  const [activeBrush, setActiveBrush] = useState('paint')
  const [showAdjustmentMenu, setShowAdjustmentMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brushSize, setBrushSize] = useState(20)

  const handleWidth = (e: any) => {
    setBrushSize(Number(e.target.value))
    canvas?.updateBrush({ width: Number(e.target.value) })
  }

  const wrapperClasses = [
    'flex',
    'flex-row',
    'items-center',
    'bg-[#ffffff]',
    `rounded-[4px]`,
    'relative',
    'mb-[8px]',
    'md:gap-[4px]',
    'justify-between',
    'p-[2px]',
    'md:p-[8px]',
    'shadow-md',
    'select-none'
  ]

  return (
    <div className={clsx(wrapperClasses)}>
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirmClick={() => {
            unlockScroll()
            handleRemoveClick()
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
            Remove image and mask?
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to remove this image and mask? They will be
              erased. This action cannot be undone.
            </p>
          </div>
        </DeleteConfirmModal>
      )}
      <div className="flex flex-row gap-1 items-center">
        {/* <ToolBarButton>
          <MenuIcon />
        </ToolBarButton> */}
        <ToolBarButton
          active={activeBrush === 'paint'}
          onClick={() => {
            setActiveBrush('paint')
            canvas?.toggleErase(false)
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
        <MinusVertical />
        <ToolBarButton onClick={canvas?.undo}>
          <UndoIcon stroke="black" />
        </ToolBarButton>
        <ToolBarButton onClick={canvas?.redo}>
          <RedoIcon stroke="black" />
        </ToolBarButton>
        <MinusVertical />
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
                  min={10}
                  max="120"
                  onChange={handleWidth}
                  value={brushSize}
                />
              </div>
            </div>
          </div>
        </DropDown>
      )}
    </div>
  )
}

export default ToolBar
