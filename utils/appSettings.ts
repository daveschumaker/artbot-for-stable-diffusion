import { fetchAvailableModels } from '../api/availableModels'
import { models } from '../api/models'
import { fetchUserDetails } from '../api/userInfo'

// @ts-ignore
import { trackNewSession } from './analytics'

/**
 * Added "Allow NSFW Image" setting on 2022-10-11.
 * Will default to false for new users.
 * If already an existing user (purely going off whether
 * they've changed default image orientation -- this is not
 * 100% foolproof), leave true so behavior doesn't change for
 * existing users.
 */
export const checkNsfwSettings = () => {
  if (
    localStorage.getItem('orientation') &&
    !localStorage.getItem('allowNsfwImages')
  ) {
    localStorage.setItem('allowNsfwImages', 'true')
  } else if (!localStorage.getItem('allowNsfwImages')) {
    localStorage.setItem('allowNsfwImages', 'false')
  }
}

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
  checkNsfwSettings()
  updateShowGrid()

  await trackNewSession()

  const apikey = localStorage.getItem('apikey') || ''
  await fetchUserDetails(apikey)
  await fetchAvailableModels()
  await models()

  setInterval(async () => {
    if (document.visibilityState !== 'visible') {
      return
    }

    await fetchUserDetails(apikey)
    await fetchAvailableModels()
    await models()
  }, 60000)
}
