import { useState } from 'react'
import DropDown from './DropDown'
import styles from './toolbar.module.css'
import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import useLockedBody from 'app/_hooks/useLockedBody'

export default function SettingMenu({
  handleClearMask = () => {},
  handleDownloadClick = () => {},
  setShowOutpaintToolbar = () => {},
  setShowSettingMenu = () => {},
  showOutpaintToolbar = false
}: {
  handleClearMask: () => any
  handleDownloadClick: () => any
  setShowOutpaintToolbar: (bool: boolean) => any
  setShowSettingMenu: (bool: boolean) => any
  showOutpaintToolbar: boolean
}) {
  const [, setLocked] = useLockedBody(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirmClick={() => {
            setLocked(false)
            handleClearMask()
            setShowDeleteModal(false)
            setShowSettingMenu(false)
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
            Remove mask?
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to remove this mask? It will be erased. This
              action cannot be undone.
            </p>
          </div>
        </DeleteConfirmModal>
      )}
      <DropDown handleClose={() => setShowSettingMenu(false)}>
        <div className={styles.toolbarMenuWrapper}>
          <div
            className={styles.toolbarMenuItem}
            onClick={() => {
              setShowOutpaintToolbar(!showOutpaintToolbar)
              setShowSettingMenu(false)
            }}
          >
            Outpainting options
          </div>
          <div
            className={styles.toolbarMenuItem}
            onClick={() => {
              handleDownloadClick()
              setShowSettingMenu(false)
            }}
          >
            Download image + mask
          </div>
          <div
            className={styles.toolbarMenuItem}
            onClick={() => {
              setShowDeleteModal(true)
            }}
          >
            Clear mask
          </div>
        </div>
      </DropDown>
    </>
  )
}
