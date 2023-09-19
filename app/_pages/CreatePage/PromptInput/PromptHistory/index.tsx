import { Button } from 'app/_components/Button'
import Input from 'app/_components/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import {
  deletePromptFromHistory,
  getPrompts,
  updatePrompt
} from 'app/_db/prompts'
import { PromptHistoryDetails, PromptTypes, SetInput } from '_types/artbot'
import {
  IconArrowBarLeft,
  IconCopy,
  IconHeart,
  IconTrash
} from '@tabler/icons-react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import styles from './component.module.css'
import FlexRow from 'app/_components/FlexRow'

const TITLE_INPUT_HEIGHT = 120

/**
 * TODO:
 * If I want to extrapolate this so it works as both a standalone page and inside a modal,
 * I'll need to figure out a way to handle dynamically setting the height of a modal.
 * Maybe some sort of hook? Or should the modal use a provider to pass context down into child components?
 */

export default function PromptHistory({
  handleClose,
  modalId,
  setInput
}: {
  handleClose: () => void
  modalId?: string
  setInput: SetInput
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [filter, setFilter] = useState('')
  const [prompts, setPrompts] = useState([])
  const [visiblePrompts, setVisiblePrompts] = useState('all')

  const handleFavoriteClick = async (p: PromptHistoryDetails) => {
    const { id, promptType } = p
    const newPromptType =
      promptType === PromptTypes.PromptFavorite
        ? PromptTypes.PromptHistory
        : PromptTypes.PromptFavorite

    await updatePrompt(id, {
      promptType: newPromptType
    })
    await fetchPrompts(visiblePrompts)
  }

  const fetchPrompts = async (promptType = 'all') => {
    let promptsResponse = []
    if (promptType === 'favorites') {
      promptsResponse = await getPrompts({
        promptType: PromptTypes.PromptFavorite
      })
    } else {
      promptsResponse = await getPrompts({
        promptType: PromptTypes.PromptHistory,
        promptType2: PromptTypes.PromptFavorite
      })
    }

    setPrompts(promptsResponse)
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  // Dynamically adjust height
  useEffect(() => {
    if (modalId && containerRef.current && prompts.length > 0) {
      const offsetHeight =
        containerRef.current.offsetHeight + TITLE_INPUT_HEIGHT
      const modal = document.getElementById(modalId)

      if (modal) {
        modal.style.height = `${offsetHeight}px`
      }
    }
  }, [modalId, prompts])

  const filteredPrompts = prompts.filter((p: PromptHistoryDetails) => {
    const format = p.prompt.toLowerCase()
    if (format.indexOf(filter.toLowerCase()) >= 0) {
      return true
    }
  })

  return (
    <div>
      <SubSectionTitle style={{ paddingBottom: '8px' }}>
        Prompt History
      </SubSectionTitle>
      <FlexRow gap={8} style={{ marginBottom: '8px' }}>
        <Button
          onClick={() => {
            if (visiblePrompts === 'all') {
              setVisiblePrompts('favorites')
              fetchPrompts('favorites')
            } else {
              setVisiblePrompts('all')
              fetchPrompts('all')
            }
          }}
        >
          <IconHeart
            fill={visiblePrompts === 'favorites' ? 'currentColor' : 'none'}
          />
        </Button>
        <Input
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilter(e.target.value)
          }
          placeholder="Search prompt history..."
          value={filter}
        />
        <Button onClick={() => setFilter('')} theme="secondary">
          <IconArrowBarLeft />
        </Button>
      </FlexRow>
      <div>
        {visiblePrompts === 'favorites' && prompts.length === 0 && (
          <FlexRow style={{ marginTop: '8px' }}>
            Nothing here, yet! Favorite some prompts to get started.
          </FlexRow>
        )}
        {visiblePrompts === 'all' && prompts.length === 0 && (
          <FlexRow style={{ marginTop: '8px' }}>
            Nothing here, yet! Create some images to get started.
          </FlexRow>
        )}
        {visiblePrompts === 'all' &&
          prompts.length > 0 &&
          filteredPrompts.length === 0 && (
            <FlexRow style={{ marginTop: '8px' }}>
              No prompts found that match the search criteria
            </FlexRow>
          )}
        {filteredPrompts.length > 0 && (
          <div className={styles.PromptsList} ref={containerRef}>
            <ul style={{ paddingLeft: '16px' }}>
              {filteredPrompts.map((prompt: PromptHistoryDetails) => {
                return (
                  <li className={styles.PromptWrapper} key={prompt.id}>
                    <div className={styles.PromptText}>{prompt.prompt}</div>
                    <FlexRow style={{ justifyContent: 'space-between' }}>
                      <div className={styles.PromptTimestamp}>
                        {new Date(prompt.timestamp).toLocaleString()}
                      </div>
                      <FlexRow
                        gap={8}
                        style={{
                          justifyContent: 'flex-end',
                          width: '160px'
                        }}
                      >
                        <Button
                          onClick={() => {
                            handleFavoriteClick(prompt)
                          }}
                          size="small"
                        >
                          <IconHeart
                            fill={
                              prompt.promptType === PromptTypes.PromptFavorite
                                ? 'currentColor'
                                : 'none'
                            }
                            stroke={1.5}
                          />
                        </Button>
                        <Button
                          onClick={() => {
                            setInput({ prompt: prompt.prompt })
                            handleClose()
                          }}
                          size="small"
                        >
                          <IconCopy stroke={1.5} />
                        </Button>
                        <Button
                          onClick={async () => {
                            await deletePromptFromHistory(prompt.id)
                            await fetchPrompts()
                          }}
                          size="small"
                          theme="secondary"
                        >
                          <IconTrash stroke={1.5} />
                        </Button>
                      </FlexRow>
                    </FlexRow>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
