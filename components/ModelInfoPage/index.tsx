/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

import { trackEvent } from '../../api/telemetry'
import Panel from '../../components/UI/Panel'
import TextButton from '../../components/UI/TextButton'
import useComponentState from '../../hooks/useComponentState'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import {
  modelInfoStore,
  setAvailableModels,
  setModelDetails
} from '../../store/modelStore'
// import { filterCompletedByModel } from '../utils/db'
import SpinnerV2 from '../../components/Spinner'
import Image from 'next/image'
import LinkIcon from '../../components/icons/LinkIcon'
import styled from 'styled-components'
import Linker from '../../components/UI/Linker'
import MenuButton from '../../components/UI/MenuButton'
import HeartIcon from '../../components/icons/HeartIcon'
import AppSettings from '../../models/AppSettings'
import { useStore } from 'statery'
import ExternalLinkIcon from '../icons/ExternalLinkIcon'

const StyledLinkIcon = styled(LinkIcon)`
  cursor: pointer;
`

const ModelInfoPage = ({ availableModels, modelDetails }: any) => {
  const router = useRouter()
  const modelState = useStore(modelInfoStore)
  const { inpaintingWorkers } = modelState

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
      const {
        description,
        homepage = '',
        name,
        nsfw,
        trigger,
        showcases,
        style
      } = modelDetails

      const modelStats = componentState.availableModels.filter((obj: any) => {
        return obj.name === name
      })

      modelDetailsArray.push(
        <div key={`${name}_panel_${idx}`}>
          <a id={name} />
          <Panel className="mb-4 text-sm">
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
            {homepage && (
              <div className="mb-2">
                <Linker
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex flex-row gap-2 items-center">
                    view homepage
                    <ExternalLinkIcon />
                  </span>
                </Linker>{' '}
              </div>
            )}
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
      {componentState.isLoading && <SpinnerV2 />}
      {!componentState.isLoading && (
        <>
          <div className="">Workers w/ inpainting: {inpaintingWorkers}</div>
          <div className="mb-2">
            Total models available: {availableModels.length}
          </div>
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

export default ModelInfoPage
