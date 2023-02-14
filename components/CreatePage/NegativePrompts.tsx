import { useEffect, useState } from 'react'
import SectionTitle from '../UI/SectionTitle'
import SlidingPanel from '../UI/SlidingPanel'
import styled from 'styled-components'
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

const Content = styled.div`
  background-color: ${(props) => props.theme.body};
  margin-bottom: 140px;

  @media (min-width: 640px) {
    margin-bottom: 8px;
  }
`

const StyledCloseButton = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;

  @media (min-width: 640px) {
    right: 16px;
  }
`

const FixedHeader = styled.div`
  position: fixed;
  background-color: ${(props) => props.theme.body};
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 8px 16px;

  @media (min-width: 640px) {
    border-radius: 4px;
  }
`

const PromptContainer = styled.div`
  border-bottom: 1px dashed white;
  margin-bottom: 8px;
  padding-bottom: 8px;
`

const NegativePrompts = ({ open, handleClosePane, setInput }: Props) => {
  const [prompts, setPrompts] = useState<Array<string>>([])

  const loadNegativePrompts = async () => {
    try {
      const result = await getPrompts(PromptTypes.Negative)

      if (Array.isArray(result)) {
        setPrompts(result)
      }
    } catch (err) {}
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
      className="mb-[200px] flex content-center"
      overlayClassName="flex flex-row justify-center z-30"
      open={open}
      handleClosePane={handleClosePane}
    >
      <div className="relative">
        <FixedHeader>
          <SectionTitle>Negative Prompt Library</SectionTitle>
          <StyledCloseButton onClick={handleClosePane}>
            <CloseIcon width={2} />
          </StyledCloseButton>
        </FixedHeader>
        <Content className="pt-[32px] mb-[100px]">
          {prompts.length === 0 && <div>Nothing here yet!</div>}
          {prompts.map((prompt: any, i) => {
            return (
              <PromptContainer key={`negative_prompt_${i}`}>
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
              </PromptContainer>
            )
          })}
        </Content>
      </div>
    </SlidingPanel>
  )
}

export default NegativePrompts
