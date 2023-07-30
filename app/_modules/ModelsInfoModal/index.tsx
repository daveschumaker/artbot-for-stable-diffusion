/* eslint-disable @next/next/no-img-element */
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  IconArrowBarLeft,
  IconEyeOff,
  IconFilter,
  IconHeart
} from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import Modal from 'components/Modal'
import { Button } from 'components/UI/Button'
import Checkbox from 'components/UI/Checkbox'
import Input from 'components/UI/Input'
import React, { useState } from 'react'
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
  const { availableModelNames, availableModels, modelDetails } =
    useStore(modelStore)

  const [inputFilter, setInputFilter] = useState('')

  const activeModelDetails = modelDetails[activeModel]
  let activeModelStats: any = {}

  for (const key in availableModels) {
    if (availableModels[key].name === activeModel) {
      activeModelStats = Object.assign({}, availableModels[key])
    }
  }

  const filteredNames = availableModelNames.filter((name) => {
    if (!inputFilter) return true
    return name.toLowerCase().indexOf(inputFilter) >= 0
  })

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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '8px',
                  padding: '8px 0'
                }}
              >
                <Checkbox
                  label={`Favorite models`}
                  checked={filterMode === 'favorites'}
                  onChange={() =>
                    filterMode === 'favorites'
                      ? setFilterMode('all')
                      : setFilterMode('favorites')
                  }
                />
                <Checkbox
                  label={`SFW only`}
                  checked={filterMode === 'sfw'}
                  onChange={() =>
                    filterMode === 'sfw'
                      ? setFilterMode('all')
                      : setFilterMode('sfw')
                  }
                />
                <Checkbox
                  label={`NSFW only`}
                  checked={filterMode === 'nsfw'}
                  onChange={() =>
                    filterMode === 'nsfw'
                      ? setFilterMode('all')
                      : setFilterMode('nsfw')
                  }
                />
                <Checkbox
                  label={`Inpainting`}
                  checked={filterMode === 'inpainting'}
                  onChange={() =>
                    filterMode === 'inpainting'
                      ? setFilterMode('all')
                      : setFilterMode('inpainting')
                  }
                />
                <Checkbox
                  label={`Has showcase image`}
                  checked={filterMode === 'showcase'}
                  onChange={() =>
                    filterMode === 'showcase'
                      ? setFilterMode('all')
                      : setFilterMode('showcase')
                  }
                />
              </div>
            </DropdownOptions>
          )}
          <Input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputFilter(e.target.value)
            }
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
              setInputFilter('')
            }}
            theme="secondary"
          >
            <IconArrowBarLeft />
          </Button>
        </FlexRow>
        <FlexRow gap={8}>
          <div className={styles.ModelsList}>
            {filteredNames.map((model) => {
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
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <div className={styles.ModelInfoName}>{activeModel}</div>
                  <FlexRow gap={8} style={{ justifyContent: 'flex-end' }}>
                    <IconEyeOff stroke={1.5} />
                    <IconHeart stroke={1.5} />
                  </FlexRow>
                </FlexRow>
                <div className={styles.ModelInfoStats}>
                  Workers: {activeModelStats.count}
                  {' / '}
                  Requests: {activeModelStats.jobs}
                </div>
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
