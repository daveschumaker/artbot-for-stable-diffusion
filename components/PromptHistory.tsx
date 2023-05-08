import { useEffect } from 'react'
import styled from 'styled-components'

import useComponentState from '../hooks/useComponentState'
import { PromptTypes } from '../types'
import { db, getPrompts } from '../utils/db'
import CopyIcon from './icons/CopyIcon'
import HeartIcon from './icons/HeartIcon'
import TrashIcon from './icons/TrashIcon'
import { Button } from './UI/Button'
import Input from './UI/Input'
import PageTitle from './UI/PageTitle'
import TextButton from './UI/TextButton'

const PromptsList = styled.div`
  background-color: ${(props) => props.theme.body};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  top: 180px;
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
    top: 164px;
  }
`

const PromptWrapper = styled.div`
  background-color: ${(props) => props.theme.body};
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  margin-bottom: 16px;
  border: 1px solid #7e5a6c;
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
    prompts: [],
    view: 'all'
  })

  const fetchPrompts = async (value?: string) => {
    let prompts = []
    if (value === 'favorites') {
      prompts = await getPrompts(PromptTypes.PromptFavorite)
    } else {
      prompts = await getPrompts(
        PromptTypes.PromptHistory,
        PromptTypes.PromptFavorite
      )
    }

    setComponentState({ prompts })
  }

  const handleFavoriteClick = async (p: any) => {
    const { id, promptType } = p
    const newPromptType =
      promptType === PromptTypes.PromptFavorite
        ? PromptTypes.PromptHistory
        : PromptTypes.PromptFavorite

    await db.prompts.update(id, {
      promptType: newPromptType
    })
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

  return (
    <>
      <PageTitle>
        {componentState.view === 'all' && `Prompt history`}
        {componentState.view === 'favorites' && `Favorite prompts`}
      </PageTitle>
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
      <div className="flex flex-row justify-between mb-2">
        <TextButton
          onClick={() => {
            if (componentState.view === 'all') {
              setComponentState({ view: 'favorites' })
              fetchPrompts('favorites')
            } else {
              setComponentState({ view: 'all' })
              fetchPrompts()
            }
          }}
        >
          {componentState.view === 'all' ? `show favorites` : `show all`}
        </TextButton>
        <TextButton
          onClick={() => {
            setComponentState({ filter: '' })
          }}
        >
          clear filter
        </TextButton>
      </div>
      {!componentState.filter && filteredPrompts.length === 0 && (
        <div>Nothing to see here. Create an image, first!</div>
      )}
      {componentState.filter && filteredPrompts.length === 0 && (
        <div>No prompts found.</div>
      )}
      {filteredPrompts.length > 0 && (
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
                        handleFavoriteClick(p)
                        fetchPrompts(componentState.view)
                      }}
                    >
                      <HeartIcon
                        size={24}
                        fill={
                          p.promptType === PromptTypes.PromptFavorite
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </Button>
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
                      theme="secondary"
                      onClick={async () => {
                        await db.prompts.bulkDelete([p.id])
                        fetchPrompts(componentState.view)
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
      )}
    </>
  )
}

export default PromptHistory
