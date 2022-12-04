import fetchAvailableModels from '../api/fetchAvailableModels'
import fetchModelDetails from '../api/fetchModelDetails'
import { fetchUserDetails } from '../api/userInfo'
import AppSettings from '../models/AppSettings'

// @ts-ignore
import { trackNewSession } from './analytics'
import { isAppActive } from './appUtils'
import { deleteStalePending } from './db'

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

  await trackNewSession()

  const apikey = AppSettings.get('apiKey') || ''
  fetchUserDetails(apikey)
  deleteStalePending()

  setInterval(async () => {
    if (!isAppActive()) {
      return
    }

    fetchAvailableModels()
    fetchModelDetails()
    deleteStalePending()
  }, 60000)

  setInterval(async () => {
    if (!isAppActive()) {
      return
    }

    fetchUserDetails(apikey)
  }, 300000)
}
