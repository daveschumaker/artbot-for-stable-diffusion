'use client'

import { initPendingJobService } from 'controllers/pendingJobsController'
import { useEffectOnce } from 'hooks/useEffectOnce'
import { initAppSettings } from 'utils/appSettings'
import { initDb } from 'utils/db'
import { initializePrimaryWindowOnLoad } from 'utils/primaryWindow'
import AppTheme from '../AppTheme'
import AppSettings from 'models/AppSettings'
import { setLockedToWorker, setPauseJobQueue } from 'store/appStore'
import { useSearchParams } from 'next/navigation'
import { handleApiKeyLogin } from 'utils/hordeUtils'
import { showSuccessToast } from 'utils/notificationUtils'

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
