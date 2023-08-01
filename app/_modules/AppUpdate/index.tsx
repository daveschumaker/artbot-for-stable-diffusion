'use client'

import ServerUpdateComponent from 'components/ServerUpdateComponent'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'
import { appInfoStore, setBuildId } from 'store/appStore'
import { isAppActive } from 'utils/appUtils'

let waitingForServerInfoRes = false

export default function AppUpdate() {
  const { buildId } = useStore(appInfoStore)
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
      const { build } = data

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

  if (showServerUpdateComponent) return <ServerUpdateComponent />

  return null
}
