import Modal from 'components/Modal'
import { SetInput } from 'types/artbot'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import NegativePromptLibrary from '../NegativePromptLibrary'

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
