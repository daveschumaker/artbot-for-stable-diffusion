'use client'

import { useSearchParams } from 'next/navigation'
import { initPendingJobService } from 'app/_controllers/pendingJobsController'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { initAppSettings } from 'app/_utils/initArtBotAppSettings'
import { initDb } from 'app/_utils/db'
import { initializePrimaryWindowOnLoad } from 'app/_utils/primaryWindow'
import AppTheme from '../AppTheme'
import AppSettings from 'app/_data-models/AppSettings'
import {
  setPauseJobQueue,
  setUseAllowedWorkers,
  setUseBlockedWorkers
} from 'app/_store/appStore'
import { handleApiKeyLogin } from 'app/_utils/hordeUtils'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import NiceModal from '@ebay/nice-modal-react'
import Modal from 'app/_componentsV2/Modal'
import { initLoadPendingJobsFromDb } from 'app/_controllers/pendingJobsCache'

NiceModal.register('confirmation-modal', Modal)
NiceModal.register('lockedToWorker-modal', Modal)
NiceModal.register('tooltip-modal', Modal)
NiceModal.register('workerDetails-modal', Modal)

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
    initLoadPendingJobsFromDb()
    initPendingJobService()
    initializePrimaryWindowOnLoad()

    const useAllowedWorkers = AppSettings.get('useAllowedWorkers') || false
    const useBlockedWorkers = AppSettings.get('useBlockedWorkers') || false
    const allowedWorkers = AppSettings.get('allowedWorkers') || []
    const blockedWorkers = AppSettings.get('blockedWorkers') || []
    if (useAllowedWorkers && allowedWorkers.length > 0) {
      setUseAllowedWorkers(true)
    } else if (useBlockedWorkers && blockedWorkers.length > 0) {
      setUseBlockedWorkers(true)
    }

    const pauseQueue = AppSettings.get('pauseJobQueue')
    if (pauseQueue) {
      setPauseJobQueue(true)
    }
  }

  useEffectOnce(() => {
    init()
  })

  return <AppTheme />
}
