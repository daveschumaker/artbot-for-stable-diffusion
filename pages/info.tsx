/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import React, { useCallback, useEffect } from 'react'
import { useStore } from 'statery'
import { useRouter } from 'next/router'

import { trackEvent } from '../api/telemetry'
import PageTitle from '../components/UI/PageTitle'
import Panel from '../components/UI/Panel'
import TextButton from '../components/UI/TextButton'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { modelInfoStore } from '../store/modelStore'
import { filterCompletedByModel } from '../utils/db'
import SpinnerV2 from '../components/Spinner'

interface IModelCount {
  [key: string]: number
}

const InfoPage = () => {
  const router = useRouter()
  const modelState = useStore(modelInfoStore)
  const [componentState, setComponentState] = useComponentState({
    imageCounts: {},
    isLoading: true,
    sort: 'count',
    view: 'models'
  })

  const sortModels = useCallback(() => {
    const modelDetailsArray: Array<any> = []

    for (const model in modelState.modelDetails) {
      const [modelStats = {}] = modelState.availableModels.filter(
        (obj: any) => {
          return obj.name === model
        }
      )

      modelDetailsArray.push({
        ...modelState.modelDetails[model],
        // @ts-ignore
        count: modelStats.count || 0,
        numImages: componentState?.imageCounts[model] || 0,
        // @ts-ignore
        queued: modelStats?.queued || 0
      })
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
  }, [
    componentState.imageCounts,
    componentState.sort,
    modelState.availableModels,
    modelState.modelDetails
  ])

  const updateLocalCount = useCallback(async () => {
    const count: IModelCount = {}

    for (const model in modelState.modelDetails) {
      const data: number = await filterCompletedByModel(model)
      count[model] = data
    }

    setComponentState({
      imageCounts: { ...count },
      isLoading: modelState.availableModels.length === 0
    })
  }, [modelState.availableModels, modelState.modelDetails, setComponentState])

  const renderModelDetails = () => {
    const modelDetailsArray: Array<React.ReactNode> = []

    sortModels().forEach((modelDetails, idx) => {
      const { description, name, nsfw, trigger, showcases, style } =
        modelDetails

      const modelStats = modelState.availableModels.filter((obj) => {
        return obj.name === name
      })

      modelDetailsArray.push(
        <Panel className="mb-2 text-sm" key={`${name}_panel_${idx}`}>
          <div className="text-lg">
            <strong>{name}</strong>
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
                      <img
                        className="rounded"
                        src={img}
                        alt={`Example of images created using ${name} model.`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
          {componentState.imageCounts[name] >= 0 ? (
            <>
              <div>
                You have made {componentState.imageCounts[name] || 0} images
                with this model.
              </div>
              <div className="flex flex-row gap-2">
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
                  View
                </TextButton>
              </div>
            </>
          ) : null}
        </Panel>
      )
    })

    return modelDetailsArray
  }

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/faq'
    })
  })

  useEffect(() => {
    updateLocalCount()
  }, [updateLocalCount])

  return (
    <div className="mb-4">
      <Head>
        <title>ArtBot - Info</title>
      </Head>
      <PageTitle>General Information</PageTitle>
      {componentState.isLoading && <SpinnerV2 />}
      {!componentState.isLoading && (
        <>
          <div className="flex flex-row gap-1 text-sm">sort by:</div>
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
            <TextButton
              onClick={() => setComponentState({ sort: 'numImages' })}
            >
              images
            </TextButton>
          </div>
          <div>{renderModelDetails()}</div>
        </>
      )}
    </div>
  )
}

export default InfoPage
