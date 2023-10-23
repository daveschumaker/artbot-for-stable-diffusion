import FlexRow from 'app/_components/FlexRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import { useAvailableModels } from 'app/_hooks/useAvailableModels'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'
import { useInput } from 'app/_modules/InputProvider/context'

interface Props {
  setShowSettingsDropdown: (bool: boolean) => any
  setShowMultiModel: (bool: boolean) => any
  showMultiModel: boolean
}

export default function ShowSettingsDropDown({
  setShowMultiModel,
  setShowSettingsDropdown,
  showMultiModel
}: Props) {
  const { input, setInput } = useInput()
  const [, filteredModels] = useAvailableModels({ input })

  const [favoriteModelsCount, setFavoriteModelsCount] = useState(0)
  const [autoKeyword, setAutoKeyword] = useState(false)

  useEffect(() => {
    const favModels = AppSettings.get('favoriteModels') || {}
    const numberFaves = Object.keys(favModels).length

    const autoAppend = AppSettings.get('modelAutokeywords') || false
    setAutoKeyword(autoAppend)
    setFavoriteModelsCount(numberFaves)
  }, [])

  return (
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
          label={`Use all models? (${filteredModels.length})`}
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
              Some models utilize keywords to trigger their specific effects.
              This option will auto-append all keywords to the prompt.
            </>
          </TooltipComponent>
        </FlexRow>
      </div>
    </DropdownOptions>
  )
}
