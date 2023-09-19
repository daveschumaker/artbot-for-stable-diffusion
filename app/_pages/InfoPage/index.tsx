'use client'

import Head from 'next/head'
import { useEffect, useState } from 'react'
import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'
import Row from 'app/_modules/Row'

interface IPerfStats {
  queued_requests: number
  queued_megapixelsteps: number
  past_minute_megapixelsteps: number
  worker_count: number
  thread_count: number
}

const InfoPage = () => {
  const [perfStats, setPerfStats] = useState<IPerfStats | null>(null)

  const fetchPerfStats = async () => {
    const res = await fetch('https://aihorde.net/api/v2/status/performance')
    const data = await res.json()

    setPerfStats(data)
  }

  useEffect(() => {
    fetchPerfStats()
  }, [])

  let stepsPerRequest: string | number = 'N/A'
  let requestsPerMinute: string | number = 'N/A'

  if (perfStats !== null && perfStats.queued_requests > 0) {
    stepsPerRequest =
      perfStats.queued_megapixelsteps / perfStats.queued_requests
    requestsPerMinute = perfStats.past_minute_megapixelsteps / stepsPerRequest
  }

  return (
    <div className="mb-4">
      <Head>
        <title>General Information - ArtBot</title>
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>General Information</PageTitle>
        </div>
      </Row>
      <div>
        General information related to resources utilized by the Stable Horde.
      </div>
      {perfStats !== null && (
        <div className="mt-2 text-sm">
          <div className="font-bold">Stable Horde performance</div>
          <div>Queued requests: {perfStats.queued_requests}</div>
          <div>
            Total workers / threads: {perfStats.worker_count}
            {' / '}
            {perfStats.thread_count}
          </div>
          <div>
            Requests fulfilled (1 minute): ~
            {
              // @ts-ignore
              isNaN(requestsPerMinute) ? 'N/A' : Math.floor(requestsPerMinute)
            }
          </div>
        </div>
      )}
      <div className="mt-2">
        <ul>
          <li>
            <Linker href="/info/models" passHref>
              Model details
            </Linker>
          </li>
          <Linker href="/info/models?show=favorite-models" passHref>
            Favorite models
          </Linker>
          <li>
            <Linker href="/info/models/updates" passHref>
              Model updates
            </Linker>
          </li>
          <li>
            <Linker href="/info/workers" passHref>
              Worker details
            </Linker>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default InfoPage
