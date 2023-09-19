import { SetInput } from '_types/artbot'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import NegativePromptLibrary from '../NegativePromptLibrary'
import Modal from 'app/_modules/Modal'

const NegativePromptLibraryModal = ({
  modalId,
  setInput
}: {
  modalId?: string
  setInput: SetInput
}) => {
  const modal = useModal()

  return (
    <Modal
      handleClose={() => {
        modal.remove()
      }}
      visible={modal.visible}
    >
      <NegativePromptLibrary
        handleClose={modal.remove}
        modalId={modalId}
        setInput={setInput}
      />
    </Modal>
  )
}

export default NiceModal.create(NegativePromptLibraryModal)
