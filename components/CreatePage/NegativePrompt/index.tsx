import { trackEvent } from 'api/telemetry'
import { Button } from 'components/UI/Button'
import FlexRow from 'components/UI/FlexRow'
import Section from 'app/_components/Section'
import TextArea from 'components/UI/TextArea'
import TextButton from 'components/UI/TextButton'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import ArrowBarLeftIcon from 'components/icons/ArrowBarLeftIcon'
import PlaylistXIcon from 'components/icons/PlaylistXIcon'
import PromptInputSettings from 'models/PromptInputSettings'
import { useCallback, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { db, getDefaultPrompt, setDefaultPrompt } from 'utils/db'
import NegativePrompts from '../NegativePrompts'
import BookIcon from 'components/icons/BookIcon'

const NegativePrompt = ({ handleChangeValue, input, setInput }: any) => {
  const [negativePromptLibraryPanelOpen, setNegativePromptLibraryPanelOpen] =
    useState(false)

  const handleSaveNeg = useCallback(async () => {
    const trimInput = input.negative.trim()
    if (!trimInput) {
      return
    }

    const defaultPromptResult = (await getDefaultPrompt()) || []
    const [defaultPrompt = {}] = defaultPromptResult

    if (defaultPrompt.prompt === trimInput) {
      return
    }

    trackEvent({
      event: 'SAVE_DEFAULT_NEG_PROMPT',
      context: '/pages/index'
    })

    try {
      await db.prompts.add({
        prompt: trimInput,
        promptType: 'negative'
      })

      await setDefaultPrompt(trimInput)
    } catch (err) {}
  }, [input.negative])
  return (
    <>
      {negativePromptLibraryPanelOpen && (
        <NegativePrompts
          open={negativePromptLibraryPanelOpen}
          handleClosePane={() => setNegativePromptLibraryPanelOpen(false)}
          setInput={setInput}
        />
      )}
      <Section>
        <div>
          <TextTooltipRow>
            <div className="flex flex-row items-center gap-2 mt-0 mb-1 text-sm font-bold">
              <PlaylistXIcon />
              Negative prompt{' '}
              <span className="font-[400] text-xs">(optional)</span>
            </div>
            <Tooltip
              // @ts-ignore
              tooltipId="negative-prompt-tooltip"
            >
              Add words or phrases to demphasize from your desired image
            </Tooltip>
          </TextTooltipRow>
        </div>
        <FlexRow>
          <TextArea
            name="negative"
            placeholder="Words to deemphasize from image"
            onChange={handleChangeValue}
            value={input.negative}
          />
          <div className="flex flex-col gap-2">
            <Button
              title="Clear current input"
              theme="secondary"
              onClick={() => {
                PromptInputSettings.set('negative', '')
                setInput({
                  negative: ''
                })
              }}
            >
              <ArrowBarLeftIcon />
            </Button>
            <Button
              title="Show negative prompt library"
              onClick={() => {
                setNegativePromptLibraryPanelOpen(true)
              }}
            >
              <BookIcon />
            </Button>
          </div>
        </FlexRow>
        <FlexRow className="mt-1">
          <TextButton
            onClick={() => {
              setDefaultPrompt('')
              PromptInputSettings.set('negative', '')
              setInput({ negative: '' })
            }}
          >
            clear default
          </TextButton>
          <TextButton onClick={handleSaveNeg}>save as default</TextButton>
        </FlexRow>
      </Section>
    </>
  )
}

export default NegativePrompt
