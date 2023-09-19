import SubSectionTitle from 'app/_components/SubSectionTitle'
import { deletePromptFromHistory, getPrompts } from 'app/_db/prompts'
import { PromptHistoryDetails, PromptTypes, SetInput } from '_types/artbot'
import { useModal } from '@ebay/nice-modal-react'
import { useEffect, useRef, useState } from 'react'
import styles from './component.module.css'
import { Button } from 'app/_components/Button'
import { IconCopy, IconTrash } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'

const TITLE_INPUT_HEIGHT = 60

export default function NegativePromptLibrary({
  modalId,
  setInput
}: {
  handleClose: () => void
  modalId?: string
  setInput: SetInput
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const modal = useModal()
  const [prompts, setPrompts] = useState<Array<PromptHistoryDetails>>([])

  const fetchPrompts = async () => {
    try {
      const result = await getPrompts({ promptType: PromptTypes.Negative })

      if (Array.isArray(result)) {
        setPrompts(result)
      }
    } catch (err) {}
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

  return (
    <div>
      <SubSectionTitle style={{ paddingBottom: '8px' }}>
        Negative Prompt Library
      </SubSectionTitle>
      <div>
        {prompts.length === 0 && (
          <div className="row">
            Nothing here, yet! Add a negative prompt to get started.
          </div>
        )}
        {prompts.length > 0 && (
          <div className={styles.PromptsList} ref={containerRef}>
            <ul style={{ paddingLeft: '16px' }}>
              {prompts.map((prompt: PromptHistoryDetails) => {
                return (
                  <li className={styles.PromptWrapper} key={prompt.id}>
                    <div className={styles.PromptText}>{prompt.prompt}</div>
                    <div className="flex flex-row justify-between w-full">
                      {prompt.timestamp && (
                        <div className={styles.PromptTimestamp}>
                          {new Date(prompt.timestamp).toLocaleString()}
                        </div>
                      )}
                      <FlexRow
                        style={{
                          columnGap: '8px',
                          justifyContent: 'flex-end',
                          width: prompt.timestamp ? '94px' : '100%'
                        }}
                      >
                        <Button
                          onClick={() => {
                            setInput({ negative: prompt.prompt })
                            modal.remove()
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
                    </div>
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
