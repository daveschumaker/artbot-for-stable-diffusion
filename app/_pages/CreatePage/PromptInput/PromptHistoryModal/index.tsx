import NiceModal, { useModal } from '@ebay/nice-modal-react'
import PromptHistory from '../PromptHistory'
import { SetInput } from '_types/artbot'
import Modal from 'app/_modules/Modal'

const PromptLibraryModal = ({
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
      style={{ backgroundColor: 'var(--body-color)' }}
      visible={modal.visible}
    >
      <PromptHistory
        handleClose={modal.remove}
        modalId={modalId}
        setInput={setInput}
      />
    </Modal>
  )
}

export default NiceModal.create(PromptLibraryModal)
