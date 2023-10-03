'use client'

import MaxWidth from 'app/_components/MaxWidth'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'
import { appInfoStore, setBuildId, setNotification } from 'app/_store/appStore'
import { isAppActive } from 'app/_utils/appUtils'
import ServerMessage from '../ServerMessage'
import ServerUpdateComponent from '../ServerUpdateComponent'

let waitingForServerInfoRes = false

export default function AppUpdate() {
  const { buildId } = useStore(appInfoStore)
  const [serverMsg, setServerMsg] = useState<any>(false)

  const [showServerUpdateComponent, setShowServerUpdateComponent] =
    useState(false)

  const fetchAppInfo = useCallback(async () => {
    if (!isAppActive()) {
      return
    }

    try {
      if (waitingForServerInfoRes) {
        return
      }

      waitingForServerInfoRes = true
      const res = await fetch('/artbot/api/server-info')
      const data = await res.json()
      const { build, serverMessage, cachedNotification = {} } = data

      waitingForServerInfoRes = false

      if (!buildId) {
        setBuildId(build)
      } else if (buildId !== build) {
        setBuildId(build)
        setShowServerUpdateComponent(true)
        console.log(
          'Application was just updated in the background. Reload this page for the latest code.'
        )
      }

      if (serverMessage) {
        setServerMsg(serverMessage)
      } else {
        setServerMsg(false)
      }

      setNotification(cachedNotification)
    } catch (err) {
      console.log(`Unable to fetch latest server-info. Connectivity issue?`)
      waitingForServerInfoRes = false
    }
  }, [buildId])

  useEffect(() => {
    fetchAppInfo()
    const interval = setInterval(async () => {
      fetchAppInfo()
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchAppInfo])

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
