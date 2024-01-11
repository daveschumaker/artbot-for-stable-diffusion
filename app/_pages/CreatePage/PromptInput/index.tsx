import {
  IconArrowBackUp,
  IconArrowBarLeft,
  IconBook,
  IconCamera,
  IconCircleCheck,
  IconCodePlus,
  IconDeviceFloppy,
  IconFolder,
  IconPlaylistAdd,
  IconPlaylistX,
  IconTags
} from '@tabler/icons-react'
import styles from './promptInput.module.css'
import { Button } from 'app/_components/Button'
import { useEffect, useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import StyleTagsDropdown from './StyleTagsDropdown'
import StylePresetsDropdown from './StylePresetsDropdown'
import { useModal } from '@ebay/nice-modal-react'
import PromptHistoryModal from './PromptHistoryModal'
import NegativePromptLibraryModal from './NegativePromptLibraryModal'
import { saveNegativePrompt } from 'app/_db/prompts'
import FlexRow from 'app/_components/FlexRow'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import KeywordsDropdown from './KeywordsDropdown'
import { hasKeywords } from './KeywordsDropdown/keywordsController'
import AppSettings from 'app/_data-models/AppSettings'
import TextArea from 'app/_components/TextArea'
import { useInput } from 'app/_modules/InputProvider/context'

export default function PromptInput() {
  const { input, setInput } = useInput()

  const [negativePanelOpen, setNegativePanelOpen] = useState(false)
  const negativePromptLibraryModal = useModal(NegativePromptLibraryModal)
  const promptHistoryModal = useModal(PromptHistoryModal)
  const [undoPrompt, setUndoPrompt] = useState('')
  const [undoNegative, setUndoNegative] = useState('')

  const [showKeywords, setShowKeywords] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [showTags, setShowTags] = useState(false)

  useEffect(() => {
    const negOpen = AppSettings.get('negativePanelOpen') || false
    setNegativePanelOpen(negOpen)
  }, [])

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
          <FlexRow gap={8}>
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
            {showKeywords && (
              <DropdownOptions
                autoSize
                handleClose={() => setShowKeywords(false)}
                height={460}
                title="Model / LoRA keywords"
                maxWidth="480px"
              >
                <KeywordsDropdown input={input} setInput={setInput} />
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
              disabled={!hasKeywords(input)}
              onClick={() => setShowKeywords(true)}
              size="small"
            >
              <IconCodePlus stroke={1.5} />
            </Button>
            <Button
              onClick={() => promptHistoryModal.show({ setInput })}
              size="small"
            >
              <IconBook stroke={1.5} />{' '}
              <span className={styles.mobileHide}>Prompts</span>
            </Button>
            <Button onClick={() => setShowTags(true)} size="small">
              <IconTags stroke={1.5} />{' '}
              <span className={styles.mobileHide}>Tags</span>
            </Button>
            <Button onClick={() => setShowPresets(true)} size="small">
              <IconCamera stroke={1.5} />{' '}
              <span className={styles.mobileHide}>Presets</span>
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
                  window.scrollTo(0, 0)
                  setUndoPrompt(input.prompt)
                  setInput({ prompt: '' })
                }
              }}
              size="small"
              theme="secondary"
            >
              {undoPrompt ? (
                <>
                  <IconArrowBackUp stroke={1.5} />{' '}
                  <span className={styles.mobileHide}>Undo</span>{' '}
                </>
              ) : (
                <>
                  <IconArrowBarLeft stroke={1.5} />{' '}
                  <span className={styles.mobileHide}>Clear</span>
                </>
              )}
            </Button>
          </div>
        </FlexRow>
      </div>
      <Accordion forceOpen={negativePanelOpen}>
        <AccordionItem
          title={
            <FlexRow
              gap={8}
              pb={4}
              style={{
                fontSize: '14px',
                fontWeight: 700,
                paddingBottom: 0
              }}
            >
              <IconPlaylistX /> Negative prompt{' '}
              <span style={{ fontSize: '12px', fontWeight: 400 }}>
                (optional)
              </span>
              {input.negative && <IconCircleCheck size={22} stroke={1.5} />}
            </FlexRow>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingTop: '8px',
              paddingBottom: '16px'
            }}
          >
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
              <FlexRow gap={8}>
                <Button
                  onClick={() => {
                    if (!input.negative || input.negative.trim().length === 0)
                      return

                    saveNegativePrompt(input.negative)
                  }}
                  size="small"
                >
                  <IconDeviceFloppy stroke={1.5} />{' '}
                  <span className={styles.mobileHide}>Save</span>
                </Button>
                <Button
                  onClick={() => negativePromptLibraryModal.show({ setInput })}
                  size="small"
                >
                  <IconFolder stroke={1.5} />{' '}
                  <span className={styles.mobileHide}>Load</span>
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
                      window.scrollTo(0, 0)
                      setUndoNegative(input.negative)
                      setInput({ negative: '' })
                    }
                  }}
                  size="small"
                  theme="secondary"
                >
                  {undoNegative ? (
                    <>
                      <IconArrowBackUp stroke={1.5} />{' '}
                      <span className={styles.mobileHide}>Undo</span>{' '}
                    </>
                  ) : (
                    <>
                      <IconArrowBarLeft stroke={1.5} />{' '}
                      <span className={styles.mobileHide}>Clear</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
