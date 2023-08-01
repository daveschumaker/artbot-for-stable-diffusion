'use client'

import { initPendingJobService } from 'controllers/pendingJobsController'
import { useEffectOnce } from 'hooks/useEffectOnce'
import { initAppSettings } from 'utils/appSettings'
import { initDb } from 'utils/db'
import { initializePrimaryWindowOnLoad } from 'utils/primaryWindow'
import AppTheme from '../AppTheme'
import AppSettings from 'models/AppSettings'
import { setLockedToWorker, setPauseJobQueue } from 'store/appStore'

export default function AppInit() {
  useEffectOnce(() => {
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
  })

  return <AppTheme />
}
