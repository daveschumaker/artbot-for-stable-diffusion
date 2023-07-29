import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { IconArrowBarLeft, IconFilter } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import Modal from 'components/Modal'
import { Button } from 'components/UI/Button'
import Input from 'components/UI/Input'
import { useState } from 'react'
import { useStore } from 'statery'
import { modelStore } from 'store/modelStore'
import DropdownOptions from '../DropdownOptions'
import styles from './component.module.css'

const ModelsInfoModal = () => {
  const modal = useModal()

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  // TODO: Should be an array so you can filter by multiple items:
  // NSFW, SFW, Favorites, hasShowcase, NoShowCase, Inpainting, Etc
  const [filterMode, setFilterMode] = useState('')
  const [activeModel, setActiveModel] = useState('')
  const { availableModelNames, modelDetails } = useStore(modelStore)

  const [inputFilter, setInputFilter] = useState('')

  const activeModelDetails = modelDetails[activeModel]
  console.log(`activeModelDetails`, activeModelDetails)

  return (
    <Modal
      className={styles.Modal}
      handleClose={() => {
        modal.remove()
      }}
      visible={modal.visible}
    >
      <div className={styles.Wrapper}>
        <div className={styles.ModalTitle}>Models</div>
        <FlexRow gap={4} pb={8}>
          {showFilterDropdown && (
            <DropdownOptions
              handleClose={() => setShowFilterDropdown(false)}
              title="Filter models"
              top="46px"
              maxWidth="280px"
              style={{
                top: '92px',
                right: '16px',
                left: 'unset',
                width: '100%'
              }}
            >
              Hi
            </DropdownOptions>
          )}
          <Input
            onChange={(e) => setInputFilter(e.target.value)}
            placeholder="Filter models by name"
            value={inputFilter}
          />
          <Button
            onClick={() => {
              setShowFilterDropdown(true)
            }}
          >
            <IconFilter />
          </Button>
          <Button
            onClick={() => {
              console.log(`hii!`)
              setInputFilter('')
            }}
            theme="secondary"
          >
            <IconArrowBarLeft />
          </Button>
        </FlexRow>
        <FlexRow gap={8}>
          <div className={styles.ModelsList}>
            {availableModelNames.map((model) => {
              return (
                <div
                  className={styles.ModelsListName}
                  key={model}
                  onClick={() => setActiveModel(model)}
                >
                  {model}
                </div>
              )
            })}
          </div>
          <div className={styles.ModelInfo}>
            {!activeModel && (
              <div>Select a model to display detailed information.</div>
            )}
            {activeModel && (
              <>
                <div className={styles.ModelInfoName}>{activeModel}</div>
                <div className={styles.ModelInfoDescription}>
                  {activeModelDetails.description}
                </div>
                {activeModelDetails.showcases && (
                  <div className={styles.ModelInfoShowcase}>
                    <img src={activeModelDetails.showcases[0]} />
                  </div>
                )}
              </>
            )}
          </div>
        </FlexRow>
      </div>
    </Modal>
  )
}

export default NiceModal.create(ModelsInfoModal)
