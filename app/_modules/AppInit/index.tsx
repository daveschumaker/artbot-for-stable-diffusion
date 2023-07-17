'use client'

import { initPendingJobService } from 'controllers/pendingJobsController'
import { useEffectOnce } from 'hooks/useEffectOnce'
import { initAppSettings } from 'utils/appSettings'
import { initBrowserTab } from 'utils/appUtils'
import { initDb } from 'utils/db'

export default function AppInit() {
  useEffectOnce(() => {
    initBrowserTab()
    initAppSettings()
    initDb()
    initPendingJobService()
  })

  return null
}
