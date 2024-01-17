/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { trackEvent } from 'app/_api/telemetry'
import Panel from 'app/_components/Panel'
import useComponentState from 'app/_hooks/useComponentState'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import SpinnerV2 from 'app/_components/Spinner'
import styled from 'styled-components'
import Linker from 'app/_components/Linker'
import MenuButton from 'app/_components/MenuButton'
import AppSettings from 'app/_data-models/AppSettings'
import { baseHost, basePath } from 'BASE_PATH'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { IconExternalLink, IconHeart, IconLink } from '@tabler/icons-react'
import TextButton from 'app/_components/TextButton'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'

const StyledLinkIcon = styled(IconLink)`
  cursor: pointer;
`

const ModelDetailsList = () => {
  const { availableModels = {}, modelDetails = {} } = useStore(modelStore)

  const router = useRouter()
  const searchParams = useSearchParams()
  const workerModels = availableModels

  // TODO: Filter and include all inpainting models (but per worker...)
  const inpaintingWorkers =
    workerModels?.['stable_diffusion_inpainting']?.count ?? 0

  const [componentState, setComponentState] = useComponentState({
    favoriteModels: {},
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

    for (const model in modelDetails) {
      const [modelStats = {}] = Object.values(availableModels).filter(
        (obj: any) => {
          return obj.name === model
        }
      )

      if (searchParams?.get('show') === 'favorite-models') {
        if (componentState.favoriteModels[model]) {
          modelDetailsArray.push({
            ...modelDetails[model],
            // @ts-ignore
            count: modelStats.count || 0,
            numImages: componentState?.imageCounts[model] || 0,
            // @ts-ignore
            queued: modelStats?.queued || 0
          })
        }
      } else {
        modelDetailsArray.push({
          ...modelDetails[model],
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

  const renderModelDetails = () => {
    const modelDetailsArray: Array<React.ReactNode> = []

    sortModels().forEach((modelDetails, idx) => {
      const {
        description,
        homepage = '',
        baseline,
        name,
        nsfw,
        trigger,
        showcases,
        style,
        version
      } = modelDetails

      const modelStats = Object.values(availableModels).filter((obj: any) => {
        return obj.name === name
      })

      if (name === 'stable_diffusion_1.4') {
        return
      }

      modelDetailsArray.push(
        <div key={`${name}_panel_${idx}`}>
          <a id={name} />
          <Panel className="mb-4 text-sm">
            <div className="flex flex-row w-full items-center">
              <div className="flex flex-row  items-center gap-1 w-1/2 text-xl">
                <Linker
                  href={`/info/models#${name}`}
                  onClick={() => {
                    navigator?.clipboard
                      ?.writeText(`${baseHost}${basePath}/info/models#${name}`)
                      .then(() => {
                        showSuccessToast({ message: 'Model URL copied!' })
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
                  <IconHeart />
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
                    <IconExternalLink />
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
            {/* <div>
              <strong>Total performance:</strong>{' '}
              {modelStats[0]?.performance?.toLocaleString() || 'N/A'}{' '}
              mega-pixelsteps
            </div> */}
            <div>
              <strong>Queued jobs:</strong> {modelStats[0]?.jobs || 0}
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
              <strong>Model baseline:</strong> {baseline}
            </div>
            <div>
              <strong>Version:</strong> {version}
            </div>
            <div>
              <strong>Style:</strong> {style}
            </div>
            {trigger ? (
              <div>
                <strong>Trigger words:</strong> &quot;{trigger.join('", "')}
                &quot;
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
                        <img
                          className="rounded"
                          src={img}
                          alt={`Example of images created using ${name} model.`}
                          height={490}
                          width={490}
                          loading="lazy"
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
                  router.push(`/create?model=${name}`)
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
  })

  // Handle scrolling to hash links after page loads.
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length > 0) {
      window.location.hash = hash
    }
  }, [])

  return (
    <div className="mb-4">
      {componentState.isLoading && <SpinnerV2 />}
      {!componentState.isLoading && (
        <>
          <div className="">Workers w/ inpainting: {inpaintingWorkers}</div>
          <div className="mb-2">
            Total models available: {Object.keys(availableModels).length}
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
          {searchParams?.get('show') === 'favorite-models' &&
            sortModels().length === 0 && (
              <div>
                You currently have no favorite models selected.{' '}
                <Linker href="/info">View all models.</Linker>
              </div>
            )}
          <div>{renderModelDetails()}</div>
        </>
      )}
    </div>
  )
}

export default ModelDetailsList
