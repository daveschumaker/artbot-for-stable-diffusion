import { GetSetPromptInput } from 'types/artbot'

import Section from 'app/_components/Section'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import FlexRow from 'app/_components/FlexRow'
import { useAvailableModels } from 'hooks/useAvailableModels'
import { Button } from 'app/_components/Button'
import { IconFilter, IconList, IconSettings } from '@tabler/icons-react'
import Checkbox from 'components/UI/Checkbox'
import AppSettings from 'models/AppSettings'
import { useStore } from 'statery'
import { modelStore } from 'store/modelStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import ModelsInfoModal from 'app/_modules/ModelsInfoModal'
import { useModal } from '@ebay/nice-modal-react'
import ShowSettingsDropDown from './ShowSettingsDropdown'
import ImageModels from 'models/ImageModels'

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
  const modelsInfoModal = useModal(ModelsInfoModal)

  const { modelDetails } = useStore(modelStore)
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
        <>
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
              input={input}
              setInput={setInput}
              setShowMultiModel={setShowMultiModel}
              setShowSettingsDropdown={setShowSettingsDropdown}
              showMultiModel={showMultiModel}
            />
          )}
          <FlexRow gap={4}>
            <Button onClick={() => modelsInfoModal.show({ input })}>
              <IconList stroke={1.5} />
            </Button>
          </FlexRow>
          <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowFilter(true)}>
              <IconFilter stroke={1.5} />
            </Button>
            {!hideOptions && (
              <Button onClick={() => setShowSettingsDropdown(true)}>
                <IconSettings stroke={1.5} />
              </Button>
            )}
          </FlexRow>
        </>
      </FlexRow>
    </Section>
  )
}

export default SelectModel
