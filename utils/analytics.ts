import { trackEvent } from '../api/telemetry'
import { isInstalledPwa } from './appUtils'
import { imageCount } from './db'

interface TrackSessionType {
  event: string
  userType: string
  referrer: string
  totalImages?: number
  PWA_APP?: boolean
  loggedIn: boolean
}

export const trackNewSession = async () => {
  if (document.visibilityState !== 'visible') {
    return
  }

  let userType = 'NEW_USER'
  if (
    localStorage.getItem('allowNsfwImages') ||
    localStorage.getItem('orientation')
  ) {
    userType = 'RETURNING_USER'
  }

  const userLoggedIn = localStorage.getItem('apikey')?.trim() || ''

  const data: TrackSessionType = {
    event: 'NEW_SESSION',
    userType,
    referrer: document.referrer || 'direct',
    loggedIn: userLoggedIn.length > 0 ? true : false
  }

  if (isInstalledPwa()) {
    data.PWA_APP = true
  }

  if (userType === 'RETURNING_USER') {
    let totalImages = await imageCount()
    data.totalImages = totalImages
  }

  trackEvent(data)
}
