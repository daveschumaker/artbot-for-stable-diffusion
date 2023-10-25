/* eslint-disable @next/next/no-img-element */
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  IconArrowBarLeft,
  IconExternalLink,
  IconEyeOff,
  IconFilter,
  IconHeart,
  IconHeartFilled
} from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import Linker from 'app/_components/Linker'
import AppSettings from 'app/_data-models/AppSettings'
import React, { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'
import DropdownOptions from '../DropdownOptions'
import styles from './component.module.css'
import Modal from '../Modal'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'

// Note: Cannot get input from context here due to using React nice modal provider.
const ModelsInfoModal = ({ input }: { input: DefaultPromptInput }) => {
  const modal = useModal()

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [favModels, setFavModels] = useState<{ [key: string]: boolean }>({})
  const [hiddenModels, setHiddenModels] = useState<{ [key: string]: boolean }>(
    {}
  )

  // TODO: Should be an array so you can filter by multiple items:
  // NSFW, SFW, Favorites, hasShowcase, NoShowCase, Inpainting, Etc
  const [filterMode, setFilterMode] = useState('all')
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

  const handleFav = (model: string) => {
    const favoriteModels = AppSettings.get('favoriteModels') || {}
    const hidden = AppSettings.get('hiddenModels') || {}

    if (!favoriteModels[model]) {
      favoriteModels[model] = true
      delete hidden[model]
    } else {
      delete favoriteModels[model]
    }

    AppSettings.save('favoriteModels', favoriteModels)
    AppSettings.save('hiddenModels', hidden)
    setFavModels(favoriteModels)
    setHiddenModels(hidden)
  }

  const handleHide = (model: string) => {
    const favoriteModels = AppSettings.get('favoriteModels') || {}
    const hidden = AppSettings.get('hiddenModels') || {}
    if (!hidden[model]) {
      hidden[model] = true
      delete favoriteModels[model]
    } else {
      delete hidden[model]
    }

    AppSettings.save('favoriteModels', favoriteModels)
    AppSettings.save('hiddenModels', hidden)
    setFavModels(favoriteModels)
    setHiddenModels(hidden)
  }

  const filtered = availableModelNames.filter((name) => {
    if (filterMode === 'all') return true

    if (filterMode === 'favorites') {
      return favModels[name] === true
    }

    if (filterMode === 'hidden') {
      return hiddenModels[name] === true
    }

    if (filterMode === 'sfw') {
      return modelDetails[name] && modelDetails[name].nsfw === false
    }

    if (filterMode === 'nsfw') {
      return modelDetails[name] && modelDetails[name].nsfw === true
    }

    if (filterMode === 'inpainting') {
      return name.toLowerCase().includes('inpainting')
    }

    if (filterMode === 'showcase') {
      return modelDetails[name] && modelDetails[name].showcases
    }

    if (filterMode === 'trigger') {
      return modelDetails[name] && modelDetails[name].trigger
    }
  })

  // Add favorite models that might not be available anymore.
  if (filterMode === 'favorites') {
    for (const key in favModels) {
      if (filtered.indexOf(key) === -1) {
        filtered.push(key)
      }
    }

    filtered.sort()
  }

  const filteredNames = filtered.filter((name) => {
    if (!inputFilter) return true
    return name.toLowerCase().indexOf(inputFilter.toLowerCase()) >= 0
  })

  useEffect(() => {
    try {
      const favoriteModels = AppSettings.get('favoriteModels') || {}
      setFavModels(favoriteModels)

      const hidden = AppSettings.get('hiddenModels') || {}
      setHiddenModels(hidden)

      if (input.models && input.models.length === 1) {
        setActiveModel(input.models[0])
      }
    } catch (err) {
      console.log(`Error:`, err)
    }

    // Ignore deps, we want this to only run on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                  label={`Hidden models`}
                  checked={filterMode === 'hidden'}
                  onChange={() =>
                    filterMode === 'hidden'
                      ? setFilterMode('all')
                      : setFilterMode('hidden')
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
                <Checkbox
                  label={`Has trigger word`}
                  checked={filterMode === 'trigger'}
                  onChange={() =>
                    filterMode === 'trigger'
                      ? setFilterMode('all')
                      : setFilterMode('trigger')
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
            {activeModel && !activeModelDetails && !activeModelStats.count && (
              <>
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <div className={styles.ModelInfoName}>{activeModel}</div>
                  <FlexRow
                    gap={8}
                    style={{
                      cursor: 'pointer',
                      justifyContent: 'flex-end',
                      width: 'unset'
                    }}
                  >
                    <div onClick={() => handleHide(activeModel)}>
                      {hiddenModels[activeModel] ? (
                        <IconEyeOff size={28} style={{ color: 'red' }} />
                      ) : (
                        <IconEyeOff size={28} stroke={1.5} />
                      )}
                    </div>
                    <div onClick={() => handleFav(activeModel)}>
                      {favModels[activeModel] ? (
                        <IconHeartFilled size={28} style={{ color: 'red' }} />
                      ) : (
                        <IconHeart size={28} stroke={1.5} />
                      )}
                    </div>
                  </FlexRow>
                </FlexRow>
                <div
                  className={styles.ModelInfoDescription}
                  style={{ paddingTop: '12px' }}
                >
                  No details exist for this model. It may not be available on
                  the AI Horde.
                </div>
              </>
            )}
            {activeModel &&
              !activeModelDetails &&
              activeModelStats.count > 0 && (
                <>
                  <FlexRow style={{ justifyContent: 'space-between' }}>
                    <div className={styles.ModelInfoName}>{activeModel}</div>
                    <FlexRow
                      gap={8}
                      style={{
                        cursor: 'pointer',
                        justifyContent: 'flex-end',
                        width: 'unset'
                      }}
                    >
                      <div onClick={() => handleHide(activeModel)}>
                        {hiddenModels[activeModel] ? (
                          <IconEyeOff size={28} style={{ color: 'red' }} />
                        ) : (
                          <IconEyeOff size={28} stroke={1.5} />
                        )}
                      </div>
                      <div onClick={() => handleFav(activeModel)}>
                        {favModels[activeModel] ? (
                          <IconHeartFilled size={28} style={{ color: 'red' }} />
                        ) : (
                          <IconHeart size={28} stroke={1.5} />
                        )}
                      </div>
                    </FlexRow>
                  </FlexRow>
                  <div className={styles.ModelInfoStats}>
                    Workers: {activeModelStats.count}
                    {' / '}
                    Requests: {activeModelStats.jobs}
                  </div>
                  <div className={styles.ModelInfoDescription}>
                    No information is available for this model.
                  </div>
                </>
              )}
            {activeModel && activeModelDetails && (
              <>
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <div className={styles.ModelInfoName}>{activeModel}</div>
                  <FlexRow
                    gap={8}
                    style={{
                      cursor: 'pointer',
                      justifyContent: 'flex-end',
                      width: 'unset'
                    }}
                  >
                    <div onClick={() => handleHide(activeModel)}>
                      {hiddenModels[activeModel] ? (
                        <IconEyeOff size={28} style={{ color: 'red' }} />
                      ) : (
                        <IconEyeOff size={28} stroke={1.5} />
                      )}
                    </div>
                    <div onClick={() => handleFav(activeModel)}>
                      {favModels[activeModel] ? (
                        <IconHeartFilled size={28} style={{ color: 'red' }} />
                      ) : (
                        <IconHeart size={28} stroke={1.5} />
                      )}
                    </div>
                  </FlexRow>
                </FlexRow>
                {activeModelDetails.homepage && (
                  <div>
                    <Linker
                      href={activeModelDetails.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span
                        className="flex flex-row gap-1 items-center"
                        style={{ fontSize: '14px', fontWeight: 400 }}
                      >
                        view homepage
                        <IconExternalLink stroke={1.5} size={16} />
                      </span>
                    </Linker>{' '}
                  </div>
                )}
                <div className={styles.ModelInfoStats}>
                  Workers: {activeModelStats.count}
                  {' / '}
                  Requests: {activeModelStats.jobs}
                  <br />
                  Style: {activeModelDetails.style}
                  <br />
                  Version: {activeModelDetails.version}
                </div>
                <div className={styles.ModelInfoDescription}>
                  {activeModelDetails.description}
                </div>
                {activeModelDetails.trigger && (
                  <div className={styles.ModelInfoTrigger}>
                    Keywords to trigger model:
                    <div style={{ fontFamily: 'monospace', paddingTop: '4px' }}>
                      {activeModelDetails.trigger.map((word) => {
                        return <span key={word}>&quot;{word}&quot; </span>
                      })}
                    </div>
                  </div>
                )}
                {activeModelDetails.showcases && (
                  <div className={styles.ModelInfoShowcase}>
                    <img
                      src={activeModelDetails.showcases[0]}
                      alt={`Image showcase for ${activeModel}`}
                    />
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
