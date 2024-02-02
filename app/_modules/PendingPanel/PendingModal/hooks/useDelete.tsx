import { useCallback } from 'react'
import ConfirmationModal from 'app/_modules/ConfirmationModal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  DeleteButtons,
  DeleteContent
} from 'app/_modules/PendingPanel/PendingModal/ImageOptions/DeleteConfirmationModal'
import { deleteImageFromDexie } from 'app/_db/image_files'

export default function useDelete({ imageId }: { imageId: string }) {
  const confirmationModal = useModal(ConfirmationModal)

  const handleDeleteImageConfirm = useCallback(async () => {
    await deleteImageFromDexie(imageId)
    console.log(`It worked!`)
    confirmationModal.remove()
  }, [confirmationModal, imageId])

  const onDeleteImageClick = useCallback(async () => {
    NiceModal.show('confirmation-modal', {
      buttons: <DeleteButtons onConfirmClick={handleDeleteImageConfirm} />,
      content: <DeleteContent />
    })
  }, [handleDeleteImageConfirm])

  return [onDeleteImageClick]
}
