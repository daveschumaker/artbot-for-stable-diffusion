'use client'

import {
  IconArrowBackUp,
  IconArrowBarLeft,
  IconBook,
  IconCamera,
  IconCircleCheckFilled,
  IconCodePlus,
  IconDeviceFloppy,
  IconFolder,
  IconPlaylistAdd,
  IconPlaylistX,
  IconTags
} from '@tabler/icons-react'
import { Label } from '../Label'
import { Tooltip } from '../Tooltip'
import { InlineCode } from '../InlineCode'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Modal from '../Modal'
import StyleTagsDropdown from 'app/_pages/CreatePage/PromptInput/StyleTagsDropdown'
import { useInput } from 'app/_modules/InputProvider/context'
import { useState } from 'react'
import StylePresetsDropdown, {
  InputPresetFilter
} from 'app/_pages/CreatePage/PromptInput/StylePresetsDropdown'
import PromptHistory from 'app/_pages/CreatePage/PromptInput/PromptHistory'
import { saveNegativePrompt } from 'app/_db/prompts'
import NegativePromptLibrary from 'app/_pages/CreatePage/PromptInput/NegativePromptLibrary'

export default function PromptInputCard() {
  const { input, setInput } = useInput()
  const modal = useModal(Modal)

  const [filter, setFilter] = useState('')
  const [undoPrompt, setUndoPrompt] = useState('')
  const [undoNegative, setUndoNegative] = useState('')

  return (
    <>
      <Modal id="tags-modal" title="Stylistic keywords">
        <StyleTagsDropdown input={input} setInput={setInput} />
      </Modal>
      <Modal id="negative-lib-modal" title="Negative prompt library">
        <NegativePromptLibrary
          handleClose={() => {
            NiceModal.remove('negative-lib-modal')
          }}
          setInput={setInput}
        />
      </Modal>
      <Modal
        id="presets-modal"
        fixedContent={
          <InputPresetFilter filter={filter} setFilter={setFilter} />
        }
        title="Style presets"
      >
        <StylePresetsDropdown
          filter={filter}
          handleClose={() => {
            NiceModal.remove('presets-modal')
          }}
          input={input}
          setInput={setInput}
        />
      </Modal>
      <div className="card bg-base-200 text-primary-content shadow-xl dark:text-white w-full">
        <div className="card-body p-2">
          <Label
            text={
              <>
                <IconPlaylistAdd /> Prompt
                <Tooltip
                  title="Image prompt"
                  text={
                    <div className="flex flex-col gap-2 text-sm">
                      <div>
                        A description of the image that you would like. e.g.,{' '}
                        <InlineCode>
                          A cool cat shredding on an electric guitar.
                        </InlineCode>{' '}
                      </div>
                      <div>
                        Some image models work better with more detailed
                        descriptions that include stylistic cues featuring
                        artist names, styles, communities. For example:{' '}
                        <InlineCode>
                          A cool cat shredding on an electric guitar, realistic,
                          photograph, detailed, HD, well lit, high quality,
                          artstation, 8k, HD render, depth of field, by Syd
                          Mead, Mariusz Lewandowski
                        </InlineCode>
                      </div>
                      <div>
                        You can emphasize particular words using image weights
                        by wrapping a word in parenthesis, followed by a number.
                        For example:{' '}
                        <InlineCode>
                          A cool cat shredding on a (purple:1.2) electric guitar
                        </InlineCode>{' '}
                        would give more weight to the word purple.
                      </div>
                      <div>
                        Additionally, you can also request multiple images using
                        an image matrix:{' '}
                        <InlineCode>
                          A cool{' '}
                          {`{cat|dog|monkey} shredding on an electric guitar`}
                        </InlineCode>{' '}
                        would generate three images using the different subjects
                        wrapped in brackets.
                      </div>
                    </div>
                  }
                />
              </>
            }
          />
          <textarea
            className="textarea textarea-primary text-black dark:text-white text-base"
            placeholder="Describe your desired image"
            onChange={(e: any) => {
              if (e.target.value) {
                setUndoPrompt('')
              }

              setInput({ prompt: e.target.value })
            }}
            value={input.prompt}
          ></textarea>
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row w-full gap-1">
              <button className="btn btn-sm btn-square btn-primary">
                <IconCodePlus />
              </button>
              <button
                className="btn btn-sm btn-primary gap-1 normal-case"
                onClick={() => {
                  modal.show({
                    content: <PromptHistory setInput={setInput} />
                  })
                }}
              >
                <IconBook />
                <span className="hidden sm:block">Prompts</span>
              </button>
              <button
                className="btn btn-sm btn-primary gap-1 normal-case"
                onClick={() => {
                  NiceModal.show('tags-modal')
                }}
              >
                <IconTags /> <span className="hidden sm:block">Tags</span>
              </button>
              <button
                className="btn btn-sm btn-primary gap-1 normal-case"
                onClick={() => {
                  NiceModal.show('presets-modal')
                }}
              >
                <IconCamera /> <span className="hidden sm:block">Presets</span>
              </button>
            </div>
            <button
              className="btn btn-sm btn-secondary btn-outline gap-1 normal-case"
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
            >
              {undoPrompt ? (
                <>
                  <IconArrowBackUp /> <span>Undo</span>{' '}
                </>
              ) : (
                <>
                  <IconArrowBarLeft /> <span>Clear</span>
                </>
              )}
            </button>
          </div>
          <details className="collapse bg-base-200 collapse-arrow">
            <summary className="collapse-title text-xl font-medium p-0 min-h-0">
              <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full select-none">
                {input.negative && (
                  <div className="text-secondary">
                    <IconCircleCheckFilled size={20} />
                  </div>
                )}
                <IconPlaylistX /> Negative Prompt{' '}
                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>
                  (optional)
                </span>
              </div>
            </summary>
            <div className="mt-2 collapse-content p-0 w-full">
              <textarea
                className="textarea textarea-primary text-black dark:text-white w-full text-base"
                placeholder="Words to de-emphasize from the image"
                onChange={(e: any) => {
                  if (e.target.value) {
                    setUndoNegative('')
                  }

                  setInput({ negative: e.target.value })
                }}
                value={input.negative}
              ></textarea>
              <div className="flex flex-row w-full justify-between">
                <div className="flex flex-row w-full gap-1">
                  <button
                    className="btn btn-sm btn-primary gap-1 normal-case"
                    onClick={() => {
                      if (!input.negative || input.negative.trim().length === 0)
                        return

                      saveNegativePrompt(input.negative)
                    }}
                  >
                    <IconDeviceFloppy /> Save
                  </button>
                  <button
                    className="btn btn-sm btn-primary gap-1 normal-case"
                    onClick={() => {
                      NiceModal.show('negative-lib-modal')
                    }}
                  >
                    <IconFolder /> Load
                  </button>
                </div>
                <button
                  className="btn btn-sm btn-secondary btn-outline gap-1 normal-case"
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
                >
                  {undoNegative ? (
                    <>
                      <IconArrowBackUp /> <span>Undo</span>{' '}
                    </>
                  ) : (
                    <>
                      <IconArrowBarLeft /> <span>Clear</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  )
}
