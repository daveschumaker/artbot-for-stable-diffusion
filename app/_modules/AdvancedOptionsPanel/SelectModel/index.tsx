import Select from 'app/_components/Select'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import FlexRow from 'app/_components/FlexRow'
import { useAvailableModels } from 'app/_hooks/useAvailableModels'
import { Button } from 'app/_components/Button'
import { IconFilter, IconList, IconSettings } from '@tabler/icons-react'
import Checkbox from 'app/_components/Checkbox'
import AppSettings from 'app/_data-models/AppSettings'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import ModelsInfoModal from 'app/_modules/ModelsInfoModal'
import { useModal } from '@ebay/nice-modal-react'
import ShowSettingsDropDown from './ShowSettingsDropdown'
import ImageModels from 'app/_data-models/ImageModels'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './component.module.css'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

interface SelectModelProps {
  disabled?: boolean
  hideOptions?: boolean
}

const SelectModel = ({
  disabled = false,
  hideOptions = false
}: SelectModelProps) => {
  const { input, setInput } = useInput()
  const modelsInfoModal = useModal(ModelsInfoModal)
  const [modelsOptions] = useAvailableModels({ input })

  const { modelDetails } = useStore(modelStore)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showMultiModel, setShowMultiModel] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterMode, setFilterMode] = useState('all')

  const handleMultiModelSelect = (
    obj: Array<{ value: string; label: string }>
  ) => {
    const modelArray: Array<string> = []

    obj.forEach((model: { value: string; label: string }) => {
      modelArray.push(model.value)
    })

    let sampler = input.sampler

    if (input.sampler === 'dpmsolver' && modelArray.length > 1) {
      sampler = 'k_euler_a'
    }

    setInput({ models: [...modelArray], sampler })
  }

  const modelerOptions = (imageParams: any) => {
    let modelsArray =
      ImageModels.getValidModels({ input: imageParams, filterNsfw: false }) ||
      []

    modelsArray.push({
      name: 'random',
      value: 'random',
      label: 'Random!',
      count: 1
    })

    return modelsArray
  }

  const modelsValue = modelerOptions(input).filter((option: any) => {
    return input?.models?.indexOf(option.value) >= 0
  })

  const modelTitle = () => {
    if (filterMode === 'nsfw') {
      return 'NSFW Model'
    }

    if (filterMode === 'sfw') {
      return 'SFW Model'
    }

    if (filterMode === 'inpainting') {
      return 'Inpainting Model'
    }

    if (filterMode === 'favorites') {
      return 'Favoritef Model'
    }

    return 'Image Model'
  }

  const filteredModels = () => {
    if (filterMode === 'nsfw') {
      return modelsOptions.filter((obj: any) => {
        return modelDetails[obj.name]?.nsfw === true
      })
    }

    if (filterMode === 'sfw') {
      return modelsOptions.filter((obj: any) => {
        return modelDetails[obj.name]?.nsfw === false
      })
    }

    if (filterMode === 'inpainting') {
      return modelsOptions.filter((obj: any) => {
        return obj?.name?.toLowerCase().includes('inpainting')
      })
    }

    if (filterMode === 'favorites') {
      const favoriteModels = AppSettings.get('favoriteModels') || {}
      const modelsArray = []
      for (const model in favoriteModels) {
        modelsArray.push({
          label: model,
          name: model,
          value: model
        })

        modelsArray.push()
      }

      return modelsArray
    }

    return modelsOptions
  }

  // let selectValue = ImageModels.dropdownValue(input)
  let selectValue: any = modelsValue
  let selectDisabled = disabled

  if (input.useAllModels) {
    selectDisabled = true
    selectValue = { label: 'Use all models', value: '' }
  }

  if (input.useFavoriteModels) {
    selectDisabled = true
    selectValue = { label: 'Use favorite models', value: '' }
  }

  const formatBaseline = (baseline: string) => {
    if (baseline === 'stable diffusion 1') {
      return `SD 1.5`
    } else if (baseline === 'stable diffusion 2') {
      return 'SD 2.0'
    } else if (baseline === 'stable_diffusion_xl') {
      return 'SDXL'
    } else {
      return baseline
    }
  }

  return (
    <OptionsRow>
      <OptionsRowLabel>
        {modelTitle()}
        <TooltipComponent tooltipId={`select-models-tooltip`}>
          Models currently available within the horde. Numbers in parentheses
          indicate number of works. Generally, these models will generate images
          quicker.
        </TooltipComponent>
      </OptionsRowLabel>
      <FlexRow
        gap={4}
        style={{
          position: 'relative',
          flexWrap: 'wrap',
          rowGap: '4px',
          justifyContent: 'flex-end'
        }}
      >
        <Select
          isDisabled={selectDisabled}
          isMulti={showMultiModel}
          isSearchable={true}
          // @ts-ignore
          formatOptionLabel={(option, { context }) => {
            if (context === 'menu') {
              return (
                <>
                  <div>{option.label}</div>
                  <div style={{ fontSize: '10px' }}>
                    Baseline:{' '}
                    {formatBaseline(modelDetails[option.value]?.baseline)}
                  </div>
                </>
              )
            } else {
              return <div>{option.label}</div>
            }
          }}
          options={filteredModels()}
          onChange={(obj: any) => {
            if (showMultiModel) {
              handleMultiModelSelect(obj)
            } else {
              setInput({ models: [obj.value] })
            }
          }}
          value={selectValue}
        />
        <div className="flex flew-row gap-[8px]">
          <Button
            className={styles['options-btn']}
            onClick={() =>
              modelsInfoModal.show({
                input
              })
            }
          >
            <IconList stroke={1.5} />
          </Button>
          <Button
            className={styles['options-btn']}
            onClick={() => setShowFilter(true)}
          >
            <IconFilter stroke={1.5} />
          </Button>
          {!hideOptions && (
            <Button
              className={styles['options-btn']}
              onClick={() => setShowSettingsDropdown(true)}
            >
              <IconSettings stroke={1.5} />
            </Button>
          )}
        </div>
        {showFilter && (
          <DropdownOptions
            handleClose={() => setShowFilter(false)}
            title="Filter models"
            top="46px"
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
                label={`Show favorite models`}
                checked={filterMode === 'favorites'}
                onChange={() =>
                  filterMode === 'favorites'
                    ? setFilterMode('all')
                    : setFilterMode('favorites')
                }
              />
              <Checkbox
                label={`Show SFW only`}
                checked={filterMode === 'sfw'}
                onChange={() =>
                  filterMode === 'sfw'
                    ? setFilterMode('all')
                    : setFilterMode('sfw')
                }
              />
              <Checkbox
                label={`Show NSFW only`}
                checked={filterMode === 'nsfw'}
                onChange={() =>
                  filterMode === 'nsfw'
                    ? setFilterMode('all')
                    : setFilterMode('nsfw')
                }
              />
              <Checkbox
                label={`Show inpainting`}
                checked={filterMode === 'inpainting'}
                onChange={() =>
                  filterMode === 'inpainting'
                    ? setFilterMode('all')
                    : setFilterMode('inpainting')
                }
              />
            </div>
          </DropdownOptions>
        )}
        {showSettingsDropdown && (
          <ShowSettingsDropDown
            setShowMultiModel={setShowMultiModel}
            setShowSettingsDropdown={setShowSettingsDropdown}
            showMultiModel={showMultiModel}
          />
        )}
      </FlexRow>
    </OptionsRow>
  )
}

export default SelectModel
