import fetchAvailableModels from '../api/fetchAvailableModels'
import fetchModelDetails from '../api/fetchModelDetails'
import { fetchUserDetails } from '../api/userInfo'

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

// Issue with new / anonymous users unable to generate images. Potentially related to
// default useTrusted value being set to false.
export const checkTrustedWorkerSettingsForAnon = () => {
  if (!localStorage.getItem('apikey')) {
    localStorage.setItem('useTrusted', 'false')
  }
}

export const initAppSettings = async () => {
  if (typeof window === 'undefined') {
    return
  }

  // app settings from local storage
  updateShowGrid()

  await trackNewSession()

  const apikey = localStorage.getItem('apikey') || ''
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
