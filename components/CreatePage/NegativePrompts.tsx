import { useEffect, useState } from 'react'
import SectionTitle from '../UI/SectionTitle'
import SlidingPanel from '../UI/SlidingPanel'
import TextButton from '../UI/TextButton'
import CloseIcon from '../icons/CloseIcon'
import { db, getPrompts, setDefaultPrompt } from '../../utils/db'
import { PromptTypes } from '../../types'
import PromptInputSettings from '../../models/PromptInputSettings'

interface Props {
  open: boolean
  handleClosePane(): void
  // @ts-ignore
  setInput(): void
}

const NegativePrompts = ({ open, handleClosePane, setInput }: Props) => {
  const [prompts, setPrompts] = useState<Array<string>>([])

  const loadNegativePrompts = async () => {
    try {
      const result = await getPrompts(PromptTypes.Negative)

      if (Array.isArray(result)) {
        setPrompts(result)
      }
    } catch (err) { }
  }

  const saveDefaultPrompt = async (prompt: string) => {
    await setDefaultPrompt(prompt)
    // @ts-ignore
    setInput({ negative: prompt })
    handleClosePane()
  }

  const updatePrompt = (prompt: string) => {
    // @ts-ignore
    setInput({ negative: prompt })
    handleClosePane()
  }

  useEffect(() => {
    loadNegativePrompts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SlidingPanel
      className="mb-[200px] flex content-center bg-[#f2f2f2] dark:bg-[#222222]"
      overlayClassName="flex flex-row justify-center z-30"
      open={open}
      handleClosePane={handleClosePane}
    >
      <div className="relative">
        <div className='fixed w-full top-0 right-0 px-5 pt-5 bg-[#f2f2f2] dark:bg-[#222222]'>
          <div className='flex flex-row'>
            <SectionTitle>Negative Prompt Library</SectionTitle>
            <div className='grow'/>
            <div onClick={handleClosePane}>
              <CloseIcon width={2} />
            </div>
          </div>
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-400"></div>
          </div>
        </div>


        <div className="pt-[48px] mb-[100px] bg-[#f2f2f2] dark:bg-[#222222]">
          {prompts.length === 0 && <div>Nothing here yet!</div>}
          {prompts.map((prompt: any, i) => {
            return (
              <div
                key={`negative_prompt_${i}`}
                className="text-[#222222] dark:text-[#f2f2f2]"
              >
                {prompt.prompt}

                <div className="flex flex-row gap-2 place-content-between items-end">
                  <div className="mt-2 mb-1 flex flex-row gap-2">
                    <TextButton
                      onClick={() => {
                        PromptInputSettings.set('negative', prompt.prompt)
                        updatePrompt(prompt.prompt)
                      }}
                    >
                      use
                    </TextButton>
                    <TextButton
                      onClick={() => {
                        PromptInputSettings.set('negative', prompt.prompt)
                        saveDefaultPrompt(prompt.prompt)
                      }}
                    >
                      set default
                    </TextButton>
                  </div>
                  <div className="mt-2 mb-1 flex flex-row gap-2">
                    <TextButton
                      color="red"
                      onClick={async () => {
                        await db.prompts.bulkDelete([prompt.id])
                        await loadNegativePrompts()
                      }}
                    >
                      delete
                    </TextButton>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SlidingPanel>
  )
}

export default NegativePrompts
