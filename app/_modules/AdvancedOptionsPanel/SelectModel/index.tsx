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
import {
  IconFilter,
  IconInfoSquareRounded,
  IconList,
  IconSettings
} from '@tabler/icons-react'
import Checkbox from 'components/UI/Checkbox'
import { validModelsArray } from 'utils/modelUtils'
import AppSettings from 'models/AppSettings'
import { useStore } from 'statery'
import { modelStore } from 'store/modelStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import SelectModelDetails from '../ModelDetails/modelDetails'

interface SelectModelProps extends GetSetPromptInput {
  disabled?: boolean
  hideOptions?: boolean
}

const SelectModel = ({
  disabled = false,
  hideOptions = false,
  input,
  setInput
}: SelectModelProps) => {
  const { modelDetails } = useStore(modelStore)
  const [favoriteModelsCount, setFavoriteModelsCount] = useState(0)
  const [modelsOptions] = useAvailableModels({ input })
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showMultiModel, setShowMultiModel] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterMode, setFilterMode] = useState('all')

  const [autoKeyword, setAutoKeyword] = useState(false)

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

  const modelTitle = () => {
    if (filterMode === 'nsfw') {
      return 'NSFW Models'
    }

    if (filterMode === 'sfw') {
      return 'SFW Models'
    }

    if (filterMode === 'inpainting') {
      return 'Inpainting Models'
    }

    if (filterMode === 'favorites') {
      return 'Favorite Models'
    }

    return 'Image Models'
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
        if (modelDetails[model]) {
          modelsArray.push({
            label: model,
            name: model,
            value: model
          })
        }
        modelsArray.push()
      }

      return modelsArray
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

    const autoAppend = AppSettings.get('modelAutokeywords') || false
    setAutoKeyword(autoAppend)
    setFavoriteModelsCount(numberFaves)
  }, [])

  return (
    <Section
      style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}
    >
      <SubSectionTitle>
        <TextTooltipRow>
          {modelTitle()}
          <TooltipComponent tooltipId={`select-models-tooltip`}>
            Models currently available within the horde. Numbers in parentheses
            indicate number of works. Generally, these models will generate
            images quicker.
          </TooltipComponent>
        </TextTooltipRow>
      </SubSectionTitle>
      <div
        style={{
          columnGap: '4px',
          marginBottom: '4px',
          position: 'relative',
          width: '100% !important'
        }}
      >
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
      </div>
      <FlexRow
        style={{
          columnGap: '4px',
          justifyContent: 'space-between',
          marginBottom: '4px',
          position: 'relative',
          width: '100%'
        }}
      >
        {showDetails && (
          <DropdownOptions
            handleClose={() => setShowDetails(false)}
            title="Model details"
            top="46px"
          >
            <SelectModelDetails
              models={input.models}
              multiModels={input.useAllModels || input.useFavoriteModels}
            />
          </DropdownOptions>
        )}
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
              <div
                style={{
                  borderBottom: '1px solid var(--input-color)',
                  width: '100%',
                  height: '4px',
                  paddingTop: '4px',
                  marginBottom: '4px'
                }}
              />
              <FlexRow>
                <Checkbox
                  label="Auto-append model(s) keywords?"
                  checked={autoKeyword}
                  onChange={(bool) => {
                    setAutoKeyword(bool)
                    AppSettings.set('modelAutokeywords', bool)
                  }}
                />
                <TooltipComponent tooltipId="auto-append-keywords">
                  <>
                    Some models utilize keywords to trigger their specific
                    effects. This option will auto-append all keywords to the
                    prompt.
                  </>
                </TooltipComponent>
              </FlexRow>
            </div>
          </DropdownOptions>
        )}
        <FlexRow style={{ columnGap: '4px' }}>
          <Button onClick={() => setShowDetails(true)}>
            <IconInfoSquareRounded />
          </Button>
          <Button onClick={() => setShowDetails(true)}>
            <IconList />
          </Button>
        </FlexRow>
        <FlexRow style={{ columnGap: '4px', justifyContent: 'flex-end' }}>
          <Button onClick={() => setShowFilter(true)}>
            <IconFilter />
          </Button>
          {!hideOptions && (
            <Button onClick={() => setShowSettingsDropdown(true)}>
              <IconSettings />
            </Button>
          )}
        </FlexRow>
      </FlexRow>
    </Section>
  )
}

export default SelectModel
