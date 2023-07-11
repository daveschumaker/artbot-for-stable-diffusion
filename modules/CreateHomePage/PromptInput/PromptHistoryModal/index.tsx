import Modal from 'components/Modal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import PromptHistory from '../PromptHistory'
import { SetInput } from 'types/artbot'

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
