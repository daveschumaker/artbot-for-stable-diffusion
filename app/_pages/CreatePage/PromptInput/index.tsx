import {
  IconArrowBackUp,
  IconBook,
  IconCamera,
  IconDeviceFloppy,
  IconFolder,
  IconPlaylistAdd,
  IconPlaylistX,
  IconTags,
  IconTrash
} from '@tabler/icons-react'
import styles from './promptInput.module.css'
import { Button } from 'components/UI/Button'
import { GetSetPromptInput } from 'types/artbot'
import { useState } from 'react'
import DropdownOptions from 'components/DropdownOptions'
import StyleTagsDropdown from './StyleTagsDropdown'
import StylePresetsDropdown from './StylePresetsDropdown'
import { useModal } from '@ebay/nice-modal-react'
import PromptHistoryModal from './PromptHistoryModal'
import NegativePromptLibraryModal from './NegativePromptLibraryModal'
import { saveNegativePrompt } from '_db/prompts'
import FlexRow from 'app/_components/FlexRow'
import TextArea from 'components/UI/TextArea'

export default function PromptInput({ input, setInput }: GetSetPromptInput) {
  const negativePromptLibraryModal = useModal(NegativePromptLibraryModal)
  const promptHistoryModal = useModal(PromptHistoryModal)
  const [undoPrompt, setUndoPrompt] = useState('')
  const [undoNegative, setUndoNegative] = useState('')

  const [showPresets, setShowPresets] = useState(false)
  const [showTags, setShowTags] = useState(false)

  return (
    <div className={styles.wrapper}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <FlexRow
          style={{
            columnGap: '4px',
            fontSize: '14px',
            fontWeight: 700,
            paddingBottom: '4px'
          }}
        >
          <IconPlaylistAdd /> Prompt
        </FlexRow>
        <TextArea
          className={styles.textArea}
          onChange={(e: any) => {
            if (e.target.value) {
              setUndoPrompt('')
            }

            setInput({ prompt: e.target.value })
          }}
          placeholder="Describe your image"
          value={input.prompt}
        />
        <FlexRow
          style={{
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 'var(--zIndex-overBase)'
          }}
        >
          <FlexRow style={{ columnGap: '8px' }}>
            {showPresets && (
              <DropdownOptions
                handleClose={() => setShowPresets(false)}
                height={480}
              >
                <StylePresetsDropdown
                  input={input}
                  setInput={setInput}
                  handleClose={() => setShowPresets(false)}
                />
              </DropdownOptions>
            )}
            {showTags && (
              <DropdownOptions
                handleClose={() => setShowTags(false)}
                height={460}
              >
                <StyleTagsDropdown input={input} setInput={setInput} />
              </DropdownOptions>
            )}
            <Button
              onClick={() => promptHistoryModal.show({ setInput })}
              size="small"
            >
              <IconBook stroke={1.5} /> Prompts
            </Button>
            <Button onClick={() => setShowTags(true)} size="small">
              <IconTags stroke={1.5} /> Tags
            </Button>
            <Button onClick={() => setShowPresets(true)} size="small">
              <IconCamera stroke={1.5} /> Presets
            </Button>
          </FlexRow>
          <div>
            <Button
              disabled={!input.prompt && !undoPrompt}
              onClick={() => {
                if (undoPrompt) {
                  setUndoPrompt('')
                  setInput({ prompt: undoPrompt })
                } else {
                  setUndoPrompt(input.prompt)
                  setInput({ prompt: '' })
                }
              }}
              size="small"
              theme="secondary"
            >
              {undoPrompt ? (
                <>
                  <IconArrowBackUp stroke={1.5} /> Undo{' '}
                </>
              ) : (
                <>
                  <IconTrash stroke={1.5} /> Clear
                </>
              )}
            </Button>
          </div>
        </FlexRow>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <FlexRow
          style={{
            columnGap: '4px',
            fontSize: '14px',
            fontWeight: 700,
            paddingBottom: '4px'
          }}
        >
          <IconPlaylistX /> Negative prompt{' '}
          <span style={{ fontSize: '12px', fontWeight: 400 }}>(optional)</span>
        </FlexRow>
        <TextArea
          className={styles.textArea}
          onChange={(e: any) => {
            if (e.target.value) {
              setUndoNegative('')
            }

            setInput({ negative: e.target.value })
          }}
          placeholder="Words to de-emphasize from this image"
          value={input.negative}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <FlexRow style={{ columnGap: '8px' }}>
            <Button
              onClick={() => {
                if (!input.negative || input.negative.trim().length === 0)
                  return

                saveNegativePrompt(input.negative)
              }}
              size="small"
            >
              <IconDeviceFloppy stroke={1.5} /> Save
            </Button>
            <Button
              onClick={() => negativePromptLibraryModal.show({ setInput })}
              size="small"
            >
              <IconFolder stroke={1.5} /> Load
            </Button>
          </FlexRow>
          <div>
            <Button
              disabled={!input.negative && !undoNegative}
              onClick={() => {
                if (undoNegative) {
                  setUndoNegative('')
                  setInput({ negative: undoNegative })
                } else {
                  setUndoNegative(input.negative)
                  setInput({ negative: '' })
                }
              }}
              size="small"
              theme="secondary"
            >
              {undoNegative ? (
                <>
                  <IconArrowBackUp stroke={1.5} /> Undo{' '}
                </>
              ) : (
                <>
                  <IconTrash stroke={1.5} /> Clear
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
