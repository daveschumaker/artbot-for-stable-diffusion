/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

import { trackEvent } from '../api/telemetry'
import PageTitle from '../components/UI/PageTitle'
import Panel from '../components/UI/Panel'
import TextButton from '../components/UI/TextButton'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { setAvailableModels, setModelDetails } from '../store/modelStore'
// import { filterCompletedByModel } from '../utils/db'
import SpinnerV2 from '../components/Spinner'
import Image from 'next/image'
import ServerMessage from '../components/ServerMessage'
import LinkIcon from '../components/icons/LinkIcon'
import styled from 'styled-components'
import Linker from '../components/UI/Linker'
import MenuButton from '../components/UI/MenuButton'
import HeartIcon from '../components/icons/HeartIcon'
import AppSettings from '../models/AppSettings'
import ChevronDownIcon from '../components/icons/ChevronDownIcon'
import ChevronRightIcon from '../components/icons/ChevronRightIcon'
import DropDownMenu from '../components/UI/DropDownMenu'
import DropDownMenuItem from '../components/UI/DropDownMenuItem'

const StyledLinkIcon = styled(LinkIcon)`
  cursor: pointer;
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
    availableModels: availableModels,
    favoriteModels: {},
    modelDetails: modelDetails,
    imageCounts: {},
    isLoading: false,
    showOptionsMenu: false,
    sort: 'count',
    view: 'models'
  })

  const handleFavoriteClick = (model = '') => {
    const favoriteModels = AppSettings.get('favoriteModels') || {}
    if (!favoriteModels[model]) {
      favoriteModels[model] = true
    } else {
      delete favoriteModels[model]
    }

    AppSettings.save('favoriteModels', favoriteModels)
    setComponentState({ favoriteModels })
  }

  const sortModels = () => {
    const modelDetailsArray: Array<any> = []

    for (const model in componentState.modelDetails) {
      const [modelStats = {}] = componentState.availableModels.filter(
        (obj: any) => {
          return obj.name === model
        }
      )

      if (router.query.show === 'favorite-models') {
        if (componentState.favoriteModels[model]) {
          modelDetailsArray.push({
            ...componentState.modelDetails[model],
            // @ts-ignore
            count: modelStats.count || 0,
            numImages: componentState?.imageCounts[model] || 0,
            // @ts-ignore
            queued: modelStats?.queued || 0
          })
        }
      } else {
        modelDetailsArray.push({
          ...componentState.modelDetails[model],
          // @ts-ignore
          count: modelStats.count || 0,
          numImages: componentState?.imageCounts[model] || 0,
          // @ts-ignore
          queued: modelStats?.queued || 0
        })
      }
    }

    modelDetailsArray.sort((a: any, b: any) => {
      if (
        componentState.sort === 'count' ||
        componentState.sort === 'numImages' ||
        componentState.sort === 'queued'
      ) {
        if (a[componentState.sort] < b[componentState.sort]) {
          return 1
        }
        if (a[componentState.sort] > b[componentState.sort]) {
          return -1
        }
      } else {
        if (a[componentState.sort] < b[componentState.sort]) {
          return -1
        }
        if (a[componentState.sort] > b[componentState.sort]) {
          return 1
        }
      }

      return 0
    })

    return modelDetailsArray
  }

  useEffectOnce(() => {
    const favoriteModels = AppSettings.get('favoriteModels') || {}
    setComponentState({ favoriteModels })
  })

  // const updateLocalCount = useCallback(async () => {
  //   const count: IModelCount = {}

  //   for (const model in modelState.modelDetails) {
  //     try {
  //       const data: number = await filterCompletedByModel(model)
  //       console.log(`model data`, model, data)
  //       count[model] = data
  //     } catch (err) {
  //       count[model] = 0
  //     }
  //   }

  //   setComponentState({
  //     imageCounts: { ...count }
  //   })
  // }, [modelState.modelDetails, setComponentState])

  const renderModelDetails = () => {
    const modelDetailsArray: Array<React.ReactNode> = []

    sortModels().forEach((modelDetails, idx) => {
      const { description, name, nsfw, trigger, showcases, style } =
        modelDetails

      const modelStats = componentState.availableModels.filter((obj: any) => {
        return obj.name === name
      })

      modelDetailsArray.push(
        <div key={`${name}_panel_${idx}`}>
          <a id={name} />
          <Panel className="mb-2 text-sm">
            <div className="flex flex-row w-full items-center">
              <div className="flex flex-row  items-center gap-1 inline-block w-1/2 text-xl">
                <Linker
                  href={`/info#${name}`}
                  onClick={() => {
                    navigator?.clipboard
                      ?.writeText(`https://tinybots.net/artbot/info/#${name}`)
                      .then(() => {
                        toast.success('Model URL copied!', {
                          pauseOnFocusLoss: false,
                          position: 'top-center',
                          autoClose: 2500,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: false,
                          draggable: false,
                          progress: undefined,
                          theme: 'light'
                        })
                      })
                  }}
                >
                  <StyledLinkIcon />
                </Linker>
                <strong>{name}</strong>
              </div>
              <div className="flex flex-row justify-end w-1/2 items-center h-[38px] relative gap-2">
                <MenuButton
                  active={componentState.favoriteModels[name]}
                  title="Save model as favorite"
                  onClick={() => handleFavoriteClick(name)}
                >
                  <HeartIcon />
                </MenuButton>
              </div>
            </div>
            <div className="mb-2">
              {nsfw ? 'This model generates NSFW images. ' : ''}
              {description}
            </div>
            <div>
              <strong>Workers available:</strong> {modelStats[0]?.count || 0}
            </div>
            <div>
              <strong>Total performance:</strong>{' '}
              {modelStats[0]?.performance?.toLocaleString() || 'N/A'}{' '}
              mega-pixelsteps
            </div>
            <div>
              <strong>Queued work:</strong>{' '}
              {modelStats[0]?.queued?.toLocaleString() || 'N/A'} mega-pixelsteps
            </div>
            <div className="mb-2">
              <strong>Estimated queue time:</strong> ~{modelStats[0]?.eta || 0}{' '}
              seconds
            </div>
            <div>
              <strong>Style:</strong> {style}
            </div>
            {trigger ? (
              <div>
                <strong>Triggers:</strong> {trigger}
              </div>
            ) : null}
            {showcases && showcases.length > 0 ? (
              <div>
                <div className="mb-2">
                  <strong>Image showcase:</strong>
                </div>
                <div className="flex flex-col md:flex-row w-full gap-2 mb-2">
                  {showcases.map((img: string, idx: number) => {
                    return (
                      <div
                        className="max-w-[490px]"
                        key={`${name}_showcase_${idx}`}
                      >
                        <Image
                          className="rounded"
                          src={img}
                          alt={`Example of images created using ${name} model.`}
                          height={490}
                          width={490}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {componentState.imageCounts[name] >= 0 ? (
              <div>
                You have made {componentState.imageCounts[name] || 0} images
                with this model.
              </div>
            ) : null}
            <div className="flex flex-row gap-2 mt-2">
              <TextButton
                disabled={
                  isNaN(modelStats[0]?.count) || modelStats[0]?.count <= 0
                }
                onClick={() => {
                  router.push(`/?model=${name}`)
                }}
              >
                Create
              </TextButton>
              <TextButton
                disabled={componentState.imageCounts[name] <= 0}
                onClick={() => {
                  router.push(`/images?model=${name}`)
                }}
              >
                View your images
              </TextButton>
            </div>
          </Panel>
        </div>
      )
    })

    return modelDetailsArray
  }

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/info'
    })

    setAvailableModels(availableModels)
    setModelDetails(modelDetails)
  })

  // Handle scrolling to hash links after page loads.
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length > 0) {
      window.location.hash = hash
    }
  }, [])

  // useEffect(() => {
  //   updateLocalCount()
  // }, [updateLocalCount])

  return (
    <div className="mb-4">
      <Head>
        <title>ArtBot - Info</title>
      </Head>
      <div className="flex flex-row w-full items-center">
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
              {!router.query.show &&
                `
                All models
                `}
              {router.query.show === 'favorite-models' && `Favorite models`}
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
            </DropDownMenu>
          )}
        </div>
      </div>
      <ServerMessage />
      {componentState.isLoading && <SpinnerV2 />}
      {!componentState.isLoading && (
        <>
          {availableModels.length > 1 ? (
            <div className="mb-2">
              Total models available: {availableModels.length}
            </div>
          ) : null}
          <div className="flex flex-row gap-1 text-sm">
            <span className="mr-2">sort by:</span>{' '}
            {componentState.sort === 'name' && `(alphabetical)`}
            {componentState.sort === 'count' && `(workers)`}
            {componentState.sort === 'queued' && `(demand)`}
          </div>
          <div className="mb-4 flex flex-row gap-1 text-sm">
            <TextButton onClick={() => setComponentState({ sort: 'name' })}>
              name
            </TextButton>
            <TextButton onClick={() => setComponentState({ sort: 'count' })}>
              workers
            </TextButton>
            <TextButton onClick={() => setComponentState({ sort: 'queued' })}>
              demand
            </TextButton>
            {/* <TextButton
              onClick={() => setComponentState({ sort: 'numImages' })}
            >
              images
            </TextButton> */}
          </div>
          <div>{renderModelDetails()}</div>
        </>
      )}
    </div>
  )
}

export default InfoPage
