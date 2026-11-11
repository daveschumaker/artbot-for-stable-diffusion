import { deletePendingJobs } from 'app/_controllers/pendingJobsCache'
import { setLoggedInState } from 'app/_store/userStore'
import { JobStatus } from '_types'
import { setUserId } from 'app/_api/userInfo'
import AppSettings from 'app/_data-models/AppSettings'

import { trackNewSession } from './analytics'
import {
  deleteDoneFromPending,
  deleteInvalidPendingJobs,
  deleteQueuedFromPending,
  deleteRequestedFromPending
} from './db'
import { initWindowLogger } from './debugTools'
import { loadAuthToken } from './authUtils'

const updateShowGrid = () => {
  if (localStorage.getItem('showGrid') === 'true') {
    localStorage.setItem('showLayout', 'grid')
  } else if (localStorage.getItem('showGrid') === 'false') {
    localStorage.setItem('showLayout', 'list')
  }

  localStorage.removeItem('showGrid')
}

const updateAppConfig = () => {
  if (AppSettings.get('v')) {
    return
  }

  const updateData: any = {}

  if (localStorage.getItem('apikey')) {
    updateData.apiKey = localStorage.getItem('apikey') || ''
  }

  if (localStorage.getItem('useTrusted') === 'true') {
    updateData.useTrusted = true
  }

  if (localStorage.getItem('allowNsfwImages') === 'true') {
    updateData.allowNsfwImages = true
  }

  if (localStorage.getItem('preserveCreateSettings') === 'true') {
    updateData.saveInputOnCreate = true
  }

  if (localStorage.getItem('runBackground') !== 'false') {
    updateData.runInBackground = true
  }

  if (
    localStorage.getItem('useBeta') === 'true' ||
    localStorage.getItem('useBeta') === 'userTrue'
  ) {
    updateData.useBeta = true
  }

  AppSettings.saveAll(updateData)

  localStorage.removeItem('apikey')
  localStorage.removeItem('useTrusted')
  localStorage.removeItem('allowNsfwImages')
  localStorage.removeItem('preserveCreateSettings')
  localStorage.removeItem('runBackground')
  localStorage.removeItem('useBeta')
}

// Track time of last visit so we can potentially clean up pending items database.
// If the user is returning to ArtBot after 30 minutes, clear out the pending items queue for performance reasons.
const appLastActive = async () => {
  const WAIT_TIME_SEC = 1800 // 30 minutes.
  const lastActiveTime = localStorage.getItem('ArtBotLastActive')
  let currentTime = Math.floor(Date.now() / 1000)

  // A navigation can happen before the first heartbeat. Publish this visit
  // immediately so the next page cannot treat newly queued work as stale.
  localStorage.setItem('ArtBotLastActive', String(currentTime))

  await deleteInvalidPendingJobs()

  if (lastActiveTime && currentTime - Number(lastActiveTime) > WAIT_TIME_SEC) {
    try {
      await deleteDoneFromPending()
      await deleteQueuedFromPending()
      await deleteInvalidPendingJobs()
      await deleteRequestedFromPending()
      deletePendingJobs(JobStatus.Done)
      deletePendingJobs(JobStatus.Queued)
      deletePendingJobs(JobStatus.Requested)
    } catch (err) {
      console.log(`An error occurred while clearing out stale pending items.`)
    }
  }

  setInterval(() => {
    currentTime = Math.floor(Date.now() / 1000)
    localStorage.setItem('ArtBotLastActive', String(currentTime))
  }, 5000)
}

// Use to fix any issues related to local storage values
// due to bad decisions on my part.
const fixLocalStorage = async () => {}

export const initAppSettings = async () => {
  if (typeof window === 'undefined') {
    return
  }

  // 2022.12.04
  // Start converting all users to new appConfig format
  updateAppConfig()

  // app settings from local storage
  updateShowGrid()
  loadAuthToken()

  await trackNewSession()

  const apikey = AppSettings.get('apiKey') || ''

  if (!apikey) {
    AppSettings.set('shareImagesExternally', true)
  } else {
    setLoggedInState(true)
  }

  initWindowLogger()
  fixLocalStorage()
  // GlobalDataSync loads and refreshes models, Horde performance, user
  // details and the user's workers.
  setUserId()
  appLastActive()
}
