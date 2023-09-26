'use client'

import { useSearchParams } from 'next/navigation'
import { initPendingJobService } from 'app/_controllers/pendingJobsController'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { initAppSettings } from 'app/_utils/initArtBotAppSettings'
import { initDb } from 'app/_utils/db'
import { initializePrimaryWindowOnLoad } from 'app/_utils/primaryWindow'
import AppTheme from '../AppTheme'
import AppSettings from 'app/_data-models/AppSettings'
import { setLockedToWorker, setPauseJobQueue } from 'app/_store/appStore'
import { handleApiKeyLogin } from 'app/_utils/hordeUtils'
import { showSuccessToast } from 'app/_utils/notificationUtils'

export default function AppInit() {
  const searchParams = useSearchParams()
  const sharedKey = searchParams?.get('shared_key')

  const init = async () => {
    const apiKey = AppSettings.get('apiKey')

    // Order here is important.
    // If a shared API key is provided, catch it here and check that it's valid.
    // If so, handleApiKeyLogin stores key in local storage, which initAppSettings
    // will use to lookup user details
    if (sharedKey && !apiKey) {
      const { success } = await handleApiKeyLogin(sharedKey)
      if (success)
        showSuccessToast({
          message: 'Successfully logged in with shared API key!'
        })
    }

    initAppSettings()
    initDb()
    initPendingJobService()
    initializePrimaryWindowOnLoad()

    const pauseQueue = AppSettings.get('pauseJobQueue')
    const workerId = AppSettings.get('useWorkerId')

    if (workerId) {
      setLockedToWorker(true)
    }

    if (pauseQueue) {
      setPauseJobQueue(true)
    }
  }

  useEffectOnce(() => {
    init()
  })

  return <AppTheme />
}
