import { IconBook, IconPlaylistAdd } from '@tabler/icons-react'
import PromptHistory from 'components/PromptHistory'
import Tooltip from 'components/Tooltip'
import { Button } from 'components/UI/Button'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import isMobile from 'is-mobile'
import PromptInputSettings from 'models/PromptInputSettings'
import BasePromptTextArea from 'modules/BasePromptTextArea'
import StylePresetsDropdown from 'modules/StylePresetsDropdown'
import StyleTagsDropdown from 'modules/StyleTagsDropdown'
import { useState } from 'react'
import { GetSetPromptInput } from 'types'

const PromptTextArea = ({ input, setInput }: GetSetPromptInput) => {
  const [showPromptHistory, setShowPromptHistory] = useState(false)

  return (
    <div className="mb-1">
      {showPromptHistory && (
        <InteractiveModal handleClose={() => setShowPromptHistory(false)}>
          <PromptHistory
            copyPrompt={setInput}
            handleClose={() => setShowPromptHistory(false)}
          />
        </InteractiveModal>
      )}
      <BasePromptTextArea
        handleChangeValue={(e) => {
          setInput({ prompt: e.target.value })
        }}
        handleClear={() => {
          PromptInputSettings.set('prompt', '')
          setInput({
            prompt: ''
          })
        }}
        label={
          <>
            <IconPlaylistAdd />
            Prompt
          </>
        }
        placeholder="Describe your image"
        optionalButton={
          <>
            <Tooltip
              disabled={isMobile()}
              targetId="view-prompt-library-tooltip"
            >
              View prompt history.
            </Tooltip>
            <Button
              id="view-prompt-library-tooltip"
              title="Show prompt history"
              onClick={() => {
                setShowPromptHistory(true)
              }}
              size="small"
            >
              <IconBook stroke={1.5} />
            </Button>
          </>
        }
        value={input.prompt}
      />
      <div className="flex flex-row gap-2 relative">
        <Tooltip disabled={isMobile()} targetId="style-tag-tooltip">
          Helpful list of styles, artists, and photography methods to add to
          your prompt.
        </Tooltip>
        <Tooltip disabled={isMobile()} targetId="style-preset-tooltip">
          Predefined community styles that will automatically select a model 66
          and add relevant prompt and negative prompt parameters when 67
          submitted to the Stable Horde API.
        </Tooltip>
        <StyleTagsDropdown input={input} setInput={setInput} />
        <StylePresetsDropdown input={input} setInput={setInput} />
      </div>
    </div>
  )
}

export default PromptTextArea
