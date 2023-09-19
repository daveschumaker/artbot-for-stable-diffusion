import { trackEvent } from 'app/_api/telemetry'
import AppSettings from 'app/_data-models/AppSettings'
import { isAppActive, isInstalledPwa } from './appUtils'
import { imageCount } from './db'

interface TrackSessionType {
  event: string
  context: string
  data: any
}

export const trackNewSession = async () => {
  if (!isAppActive()) {
    return
  }

  let userType = 'NEW_USER'
  if (
    localStorage.getItem('allowNsfwImages') ||
    localStorage.getItem('orientation')
  ) {
    userType = 'RETURNING_USER'
  }

  const userLoggedIn = AppSettings.get('apiKey')?.trim() || ''

  const data: TrackSessionType = {
    event: 'NEW_SESSION',
    context: userType,
    data: {
      referrer: document.referrer || 'direct',
      loggedIn: userLoggedIn.length > 0 ? true : false
    }
  }

  if (isInstalledPwa()) {
    data.data.PWA_APP = true
  }

  if (userType === 'RETURNING_USER') {
    let totalImages = await imageCount()
    data.data.totalImages = totalImages
  }

  trackEvent(data)
}
