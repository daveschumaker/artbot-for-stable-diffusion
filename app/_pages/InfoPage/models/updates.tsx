'use client'

import Head from 'next/head'
import { useEffect, useState } from 'react'
import { fetchModelUpdates } from 'api/fetchModelUpdates'
import InfoPageMenuButton from 'components/InfoPage/Menu'
import Row from 'components/Row'
import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'
import { relativeTimeSec } from 'utils/numberUtils'
import { baseHost, basePath } from 'BASE_PATH'

interface IModelUpdatesResponse {
  success: boolean
  changes: Array<IModelUpdate>
  timestamp: number
}

interface IModelUpdate {
  modelName: string
  timestamp: number
  status: string
}

const ModelUpdatesPage = () => {
  const [updates, setUpdates] = useState<any>([])

  const getModelUpdates = async () => {
    try {
      let changeArray: Array<any> = []
      // @ts-ignore
      const data: IModelUpdatesResponse = await fetchModelUpdates()
      const { changes = [], timestamp } = data

      changes.forEach((change: any) => {
        if (change) {
          changeArray.push({
            modelName: change.modelName,
            timeAgo: relativeTimeSec({
              now: timestamp,
              compare: change.timestamp
            }),
            version: change.version,
            status: change.status
          })
        }
      })

      changeArray.reverse()
      setUpdates(changeArray)
    } catch (err) {}
  }

  useEffect(() => {
    getModelUpdates()
  }, [])

  const renderUpdates = () => {
    let changeArray: any = []

    updates.forEach((modelUpdate: any, i: number) => {
      const { modelName, version = 0, status } = modelUpdate
      const key = ['update', i, modelName, version, status].join('_')

      if (modelUpdate.status === 'UPDATED') {
        changeArray.push(
          <li className="mt-2" key={key}>
            <div className="text-md">
              Model updated:{' '}
              <Linker href={`/info/models#${modelName}`} passHref>
                {modelName}
              </Linker>{' '}
              updated to version <strong>{version}</strong>
            </div>
            <div className="text-sm">{modelUpdate.timeAgo}</div>
          </li>
        )
      }

      if (modelUpdate.status === 'REMOVED') {
        changeArray.push(
          <li className="mt-2" key={key}>
            <div className="text-md">Model removed: {modelName}</div>
            <div className="text-sm">{modelUpdate.timeAgo}</div>
          </li>
        )
      }

      if (modelUpdate.status === 'ADDED') {
        changeArray.push(
          <li className="mt-2" key={key}>
            <div className="text-md">
              New model added:{' '}
              <Linker href={`/info/models#${modelName}`} passHref>
                {modelName} (v.{version})
              </Linker>
            </div>
            <div className="text-sm">{modelUpdate.timeAgo}</div>
          </li>
        )
      }
    })

    return changeArray
  }

  return (
    <div className="mb-4">
      <Head>
        <title>Stable Horde Model Updates - ArtBot</title>
        <meta name="twitter:title" content="Model Updates for Stable Horde" />
        <meta
          name="twitter:description"
          content="Recent updates to models currently served on the Stable Horde."
        />
        <meta
          name="twitter:image"
          content={`${baseHost}${basePath}/robot_clipboard.png`}
        />
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>Model Updates</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <InfoPageMenuButton title="Model updates" />
        </div>
      </Row>
      <div>A list of recent updates for models served by the Stable Horde.</div>
      <div className="mt-2">
        <PageTitle as="h2">Recent changes:</PageTitle>
      </div>
      <div className="mt-2">
        <ul>{updates.length > 0 ? renderUpdates() : null}</ul>
      </div>
    </div>
  )
}

export default ModelUpdatesPage
