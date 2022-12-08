import Head from 'next/head'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import ChevronDownIcon from '../../components/icons/ChevronDownIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ModelInfoPage from '../../components/ModelInfoPage'
import Row from '../../components/Row'
import ServerMessage from '../../components/ServerMessage'
import DropDownMenu from '../../components/UI/DropDownMenu'
import DropDownMenuItem from '../../components/UI/DropDownMenuItem'
import MenuButton from '../../components/UI/MenuButton'
import PageTitle from '../../components/UI/PageTitle'
import useComponentState from '../../hooks/useComponentState'

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

export async function getServerSideProps() {
  let availableModels: Array<any> = []
  let modelDetails: any = {}

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/details`
    )
    const modelDetailsData = (await modelDetailsRes.json()) || {}
    modelDetails = modelDetailsData.models
  } catch (err) {}

  return {
    props: {
      availableModels,
      modelDetails
    }
  }
}

const InfoPage = ({ availableModels, modelDetails }: any) => {
  const router = useRouter()
  const [componentState, setComponentState] = useComponentState({
    showOptionsMenu: false
  })

  const getMenuTitle = () => {
    if (
      Array.isArray(router?.query?.infoSource) &&
      router?.query?.infoSource[0] === 'workers'
    ) {
      return 'All workers'
    }

    if (router.query.show === 'favorite-models') {
      return `Favorite models`
    }

    return 'All models'
  }

  return (
    <div className="mb-4">
      <Head>
        <title>ArtBot - Info</title>
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>General Information</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <MenuButton
            active={componentState.showOptionsMenu}
            title="View model details"
            onClick={() => {
              if (componentState.showOptionsMenu) {
                setComponentState({
                  showOptionsMenu: false
                })
              } else {
                setComponentState({
                  showOptionsMenu: true
                })
              }
            }}
          >
            <div className="flex flex-row gap-1 pr-2">
              {componentState.showOptionsMenu ? (
                <ChevronDownIcon />
              ) : (
                <ChevronRightIcon />
              )}
              {getMenuTitle()}
            </div>
          </MenuButton>
          {componentState.showOptionsMenu && (
            <DropDownMenu>
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    showOptionsMenu: false
                  })
                  router.push(
                    //@ts-ignore
                    `/info`
                  )
                }}
              >
                All models
              </DropDownMenuItem>
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    showOptionsMenu: false
                  })
                  router.push(
                    //@ts-ignore
                    `/info?show=favorite-models`
                  )
                }}
              >
                Favorite models
              </DropDownMenuItem>
              <MenuSeparator />
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    showOptionsMenu: false
                  })
                  router.push(
                    //@ts-ignore
                    `/info/workers`
                  )
                }}
              >
                All workers
              </DropDownMenuItem>
            </DropDownMenu>
          )}
        </div>
        <ServerMessage />
      </Row>
      <ModelInfoPage
        availableModels={availableModels}
        modelDetails={modelDetails}
      />
    </div>
  )
}

export default InfoPage
