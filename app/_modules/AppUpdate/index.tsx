'use client'

import { basePath } from 'BASE_PATH'
import MaxWidth from 'app/_components/MaxWidth'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useIsAppActive } from 'app/_hooks/useIsAppActive'
import { useStore } from 'statery'
import { appInfoStore, setBuildId, setNotification } from 'app/_store/appStore'
import ServerMessage from '../ServerMessage'
import ServerUpdateComponent from '../ServerUpdateComponent'

const fetchServerInfo = async (signal?: AbortSignal) => {
  const res = await fetch(`${basePath}/api/server-info`, { signal })
  if (!res.ok) throw new Error(`Unable to fetch server info: ${res.status}`)
  return res.json()
}

export default function AppUpdate() {
  const { buildId } = useStore(appInfoStore)
  const appActive = useIsAppActive()
  const [showServerUpdateComponent, setShowServerUpdateComponent] =
    useState(false)

  const { data } = useQuery({
    queryKey: ['artbot', 'server-info'],
    queryFn: ({ signal }) => fetchServerInfo(signal),
    // Check for a new build or server message every 10 seconds while the app
    // is active. useIsAppActive decides, including in background windows.
    refetchInterval: appActive ? 10000 : false,
    refetchIntervalInBackground: true
  })

  useEffect(() => {
    if (!data) return
    const { build, cachedNotification = {} } = data

    if (!buildId) {
      setBuildId(build)
    } else if (buildId !== build) {
      setBuildId(build)
      setShowServerUpdateComponent(true)
      console.log(
        'Application was just updated in the background. Reload this page for the latest code.'
      )
    }

    setNotification(cachedNotification)
  }, [buildId, data])

  const serverMsg = data?.serverMessage || false

  return (
    <>
      {serverMsg && (
        <MaxWidth style={{ margin: '0 auto' }}>
          <ServerMessage
            title={serverMsg.title}
            content={serverMsg.content}
            timestamp={serverMsg.timestamp}
          />
        </MaxWidth>
      )}
      {showServerUpdateComponent && <ServerUpdateComponent />}
    </>
  )
}
