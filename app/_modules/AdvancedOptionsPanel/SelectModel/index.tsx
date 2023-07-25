import { GetSetPromptInput } from 'types/artbot'

import Section from 'app/_components/Section'
// import ImageModels from 'models/ImageModels'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { useEffect, useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
// import styles from './component.module.css'
import FlexRow from 'app/_components/FlexRow'
import { useAvailableModels } from 'hooks/useAvailableModels'
import { Button } from 'components/UI/Button'
import { IconFilter, IconSettings } from '@tabler/icons-react'
import Checkbox from 'components/UI/Checkbox'
import { validModelsArray } from 'utils/modelUtils'
import AppSettings from 'models/AppSettings'
import { useStore } from 'statery'
import { modelStore } from 'store/modelStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import TextTooltipRow from 'app/_components/TextTooltipRow'

interface SelectModelProps extends GetSetPromptInput {
  disabled?: boolean
}

const SelectModel = ({ disabled, input, setInput }: SelectModelProps) => {
  const { modelDetails } = useStore(modelStore)
  const [favoriteModelsCount, setFavoriteModelsCount] = useState(0)
  const [modelsOptions] = useAvailableModels({ input })
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
    let modelsArray = validModelsArray({ imageParams, filterNsfw: false }) || []

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

    return modelsOptions
  }

  // let selectValue = ImageModels.dropdownValue(input)
  let selectValue = modelsValue
  let selectDisabled = disabled

  if (input.useAllModels) {
    selectDisabled = true
    selectValue = { label: 'Use all models', value: '' }
  }

  if (input.useFavoriteModels) {
    selectDisabled = true
    selectValue = { label: 'Use favorite models', value: '' }
  }

  useEffect(() => {
    const favModels = AppSettings.get('favoriteModels') || {}
    const numberFaves = Object.keys(favModels).length

    setFavoriteModelsCount(numberFaves)
  }, [])

  return (
    <Section
      style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}
    >
      <SubSectionTitle>
        <TextTooltipRow>
          Model
          <TooltipComponent tooltipId={`select-models-tooltip`}>
            Models currently available within the horde. Numbers in parentheses
            indicate number of works. Generally, these models will generate
            images quicker.
          </TooltipComponent>
        </TextTooltipRow>
      </SubSectionTitle>
      <FlexRow
        style={{
          columnGap: '4px',
          marginBottom: '8px',
          position: 'relative',
          width: '100% !important'
        }}
      >
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
                  filterMode === 'inpainting'
                    ? setFilterMode('favorites')
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
          <DropdownOptions
            handleClose={() => setShowSettingsDropdown(false)}
            title="Model options"
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
                label={`Use all models? (${
                  validModelsArray({
                    imageParams: input,
                    filterNsfw: false
                  }).length
                })`}
                checked={input.useAllModels}
                onChange={(bool) => {
                  setInput({ useAllModels: bool, useFavoriteModels: false })
                  setShowMultiModel(false)
                }}
              />
              <Checkbox
                label={`Use favorite models? (${favoriteModelsCount})`}
                checked={input.useFavoriteModels}
                onChange={(bool) => {
                  setInput({ useAllModels: false, useFavoriteModels: bool })
                  setShowMultiModel(false)
                }}
              />
              <Checkbox
                label="Use multiple models?"
                checked={showMultiModel}
                onChange={(bool) => {
                  setShowMultiModel(bool)

                  setInput({ useAllModels: false, useFavoriteModels: false })
                  if (!bool && input.models.length === 0) {
                    // TODO: Set this to user preference, if available.
                    setInput({ models: ['stable_diffusion'] })
                  }
                }}
              />
            </div>
          </DropdownOptions>
        )}
        <Select
          isDisabled={selectDisabled}
          isMulti={showMultiModel}
          isSearchable={true}
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
        <Button onClick={() => setShowFilter(true)}>
          <IconFilter />
        </Button>
        <Button onClick={() => setShowSettingsDropdown(true)}>
          <IconSettings />
        </Button>
      </FlexRow>
    </Section>
  )
}

export default SelectModel
