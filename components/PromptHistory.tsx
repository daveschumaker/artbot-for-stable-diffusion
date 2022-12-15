import { useEffect } from 'react'
import styled from 'styled-components'

import useComponentState from '../hooks/useComponentState'
import { PromptTypes } from '../types'
import { db, getPrompts } from '../utils/db'
import CopyIcon from './icons/CopyIcon'
import TrashIcon from './icons/TrashIcon'
import { Button } from './UI/Button'
import Input from './UI/Input'
import PageTitle from './UI/PageTitle'

const PromptsList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  top: 160px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  position: fixed;

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  * {
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    top: 120px;
    height: 360px;
  }
`

const PromptWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  margin-bottom: 16px;
  border: 1px solid white;
  border-radius: 4px;
  padding: 8px;
  position: relative;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: space-between;
  margin-top: 8px;
`

const Timestamp = styled.div`
  color: gray;
  font-size: 12px;
`

// const MenuButtonWrapper = styled.div`
//   position: absolute;
//   top: 8px;
//   right: 8px;
// `

const PromptText = styled.div`
  margin-right: 40px;
`

const PromptHistory = (props: any) => {
  const [componentState, setComponentState] = useComponentState({
    filter: '',
    prompts: []
  })

  const fetchPrompts = async () => {
    const prompts = await getPrompts(PromptTypes.PromptHistory)
    setComponentState({ prompts })
  }

  useEffect(() => {
    fetchPrompts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredPrompts = componentState.prompts.filter((p: any) => {
    const format = p.prompt.toLowerCase()
    if (format.indexOf(componentState.filter.toLowerCase()) >= 0) {
      return true
    }
  })

  if (!componentState.filter && filteredPrompts.length === 0) {
    return (
      <>
        <PageTitle>Prompt History</PageTitle>
        <div>Nothing to see here. Create an image, first!</div>
      </>
    )
  }

  if (componentState.filter && filteredPrompts.length === 0) {
    return (
      <>
        <PageTitle>Prompt History</PageTitle>
        <div>
          <Input
            // @ts-ignore
            className="mb-2"
            type="text"
            name="filterPrompt"
            placeholder="Filter prompts"
            onChange={(e: any) => {
              setComponentState({ filter: e.target.value })
            }}
            // @ts-ignore
            value={componentState.filter}
            width="100%"
          />
        </div>
        <div>No prompts found.</div>
      </>
    )
  }

  return (
    <>
      <PageTitle>Prompt History</PageTitle>
      <div>
        <Input
          // @ts-ignore
          className="mb-2"
          type="text"
          name="filterPrompt"
          placeholder="Filter prompts"
          onChange={(e: any) => {
            setComponentState({ filter: e.target.value })
          }}
          // @ts-ignore
          value={componentState.filter}
          width="100%"
        />
      </div>
      <PromptsList>
        {filteredPrompts.map((p: any) => {
          return (
            <PromptWrapper key={`prompt_${p.id}`}>
              {/* <MenuButtonWrapper>
                <MenuButton
                  // active={optimisticFavorite}
                  title="Save as favorite"
                  // onClick={handleFavoriteClick}
                >
                  <HeartIcon />
                </MenuButton>
              </MenuButtonWrapper> */}
              <PromptText>{p.prompt}</PromptText>
              <Row>
                <div>
                  <Timestamp>
                    {new Date(p.timestamp).toLocaleString()}
                  </Timestamp>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    onClick={() => {
                      props.copyPrompt({ prompt: p.prompt })
                      props.handleClose()
                    }}
                  >
                    <CopyIcon size={24} />
                  </Button>
                  <Button
                    title="Delete prompt"
                    btnType="secondary"
                    onClick={async () => {
                      await db.prompts.bulkDelete([p.id])
                      fetchPrompts()
                    }}
                  >
                    <TrashIcon size={24} />
                  </Button>
                </div>
              </Row>
            </PromptWrapper>
          )
        })}
      </PromptsList>
    </>
  )
}

export default PromptHistory
