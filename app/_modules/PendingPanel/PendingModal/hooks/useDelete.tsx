import { useCallback, useContext } from 'react'
import ConfirmationModal from 'app/_modules/ConfirmationModal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  DeleteButtons,
  DeleteContent
} from 'app/_modules/PendingPanel/PendingModal/ImageOptions/DeleteConfirmationModal'
import { deleteImageFromDexie } from 'app/_db/image_files'
import { ImageDetailsContext } from '../ImageDetailsProvider'

export default function useDelete({ imageId }: { imageId: string }) {
  const context = useContext(ImageDetailsContext)
  const { imageDetails, refreshImageDetails } = context

  const confirmationModal = useModal(ConfirmationModal)

  const handleDeleteImageConfirm = useCallback(async () => {
    await deleteImageFromDexie(imageId)
    await refreshImageDetails(imageDetails.jobId)
    confirmationModal.remove()
  }, [confirmationModal, imageDetails.jobId, imageId, refreshImageDetails])

  const onDeleteImageClick = useCallback(async () => {
    NiceModal.show('confirmation-modal', {
      buttons: <DeleteButtons onConfirmClick={handleDeleteImageConfirm} />,
      content: <DeleteContent />
    })
  }, [handleDeleteImageConfirm])

  return [onDeleteImageClick]
}
