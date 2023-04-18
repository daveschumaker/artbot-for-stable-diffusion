import { Button } from 'components/UI/Button'
import FlexRow from 'components/UI/FlexRow'
import TextArea from 'components/UI/TextArea'
import ArrowBarLeftIcon from 'components/icons/ArrowBarLeftIcon'
import BookIcon from 'components/icons/BookIcon'
import PlaylistXIcon from 'components/icons/PlaylistXIcon'
import PromptInputSettings from 'models/PromptInputSettings'
import PromptHistory from 'components/PromptHistory'
import { useState } from 'react'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'

const PromptText = ({ handleChangeValue, input, setInput }: any) => {
  const [showPromptHistory, setShowPromptHistory] = useState(false)

  return (
    <>
      {showPromptHistory && (
        <InteractiveModal handleClose={() => setShowPromptHistory(false)}>
          <PromptHistory
            copyPrompt={setInput}
            handleClose={() => setShowPromptHistory(false)}
          />
        </InteractiveModal>
      )}
      <div className="flex flex-row items-center gap-2 mt-0 mb-1 text-sm font-bold">
        <PlaylistXIcon hideCross />
        Prompt
      </div>
      <FlexRow>
        <TextArea
          name="prompt"
          placeholder="Describe your image..."
          onChange={handleChangeValue}
          value={input.prompt}
        />
        <div className="flex flex-col gap-2">
          <Button
            title="Clear current input"
            btnType="secondary"
            onClick={() => {
              PromptInputSettings.set('prompt', '')
              setInput({
                prompt: ''
              })
            }}
          >
            <ArrowBarLeftIcon />
          </Button>
          <Button
            title="Show prompt history"
            onClick={() => {
              setShowPromptHistory(true)
            }}
          >
            <BookIcon />
          </Button>
        </div>
      </FlexRow>
    </>
  )
}

export default PromptText
