import { initLoadPendingJobsFromDb } from 'controllers/pendingJobsCache'
import { buildModelAvailability } from '../api/fetchAvailableModels'
import { fetchHordePerformance } from '../api/fetchHordePerformance'
import fetchMyWorkers from '../api/fetchMyWorkers'
import { fetchUserDetails, setUserId } from '../api/userInfo'
import AppSettings from '../models/AppSettings'
import PromptInputSettings from '../models/PromptInputSettings'

// @ts-ignore
import { trackNewSession } from './analytics'
import { isAppActive } from './appUtils'
import { deleteDoneFromPending, deleteInvalidPendingJobs } from './db'
import { initWindowLogger } from './debugTools'

export const updateShowGrid = () => {
  if (localStorage.getItem('showGrid') === 'true') {
    localStorage.setItem('showLayout', 'grid')
  } else if (localStorage.getItem('showGrid') === 'false') {
    localStorage.setItem('showLayout', 'list')
  }

  localStorage.removeItem('showGrid')
}

export const updateAppConfig = () => {
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

  if (localStorage.getItem('runBackground') === 'true') {
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

  if (PromptInputSettings.get('control_type') === 'none') {
    PromptInputSettings.set('control_type', '')
  }
}

// Track time of last visit so we can potentially clean up pending items database.
// If the user is returning to ArtBot after 30 minutes, clear out the pending items queue for performance reasons.
export const appLastActive = async () => {
  const WAIT_TIME_SEC = 1800 // 30 minutes.
  const lastActiveTime = localStorage.getItem('ArtBotLastActive')

  await deleteInvalidPendingJobs()

  let currentTime = Math.floor(Date.now() / 1000)
  if (lastActiveTime && currentTime - Number(lastActiveTime) > WAIT_TIME_SEC) {
    try {
      deleteDoneFromPending()
    } catch (err) {
      console.log(`An error occurred while clearing out stale pending items.`)
    }
  }

  setInterval(() => {
    currentTime = Math.floor(Date.now() / 1000)
    localStorage.setItem('ArtBotLastActive', String(currentTime))
  }, 1000)
}

// Use to fix any issues related to local storage values
// due to bad decisions on my part.
export const fixLocalStorage = () => {
  if (PromptInputSettings.get('control_type') === 'none') {
    PromptInputSettings.set('control_type', '')
  }

  if (PromptInputSettings.get('parentJobId')) {
    PromptInputSettings.delete('parentJobId')
  }
}

export const initAppSettings = async () => {
  if (typeof window === 'undefined') {
    return
  }

  // 2022.12.04
  // Start converting all users to new appConfig format
  updateAppConfig()

  // app settings from local storage
  updateShowGrid()

  initLoadPendingJobsFromDb()

  await trackNewSession()

  const apikey = AppSettings.get('apiKey') || ''

  if (!apikey) {
    AppSettings.set('shareImagesExternally', true)
  }

  initWindowLogger()
  fixLocalStorage()
  fetchHordePerformance()
  await fetchUserDetails(apikey)
  setUserId()
  buildModelAvailability()
  fetchMyWorkers()
  appLastActive()

  setInterval(async () => {
    if (!isAppActive()) {
      return
    }

    buildModelAvailability()
    fetchHordePerformance()
  }, 20000)

  setInterval(async () => {
    if (!isAppActive()) {
      return
    }

    await fetchUserDetails(apikey)
    fetchMyWorkers()
  }, 60000)
}
