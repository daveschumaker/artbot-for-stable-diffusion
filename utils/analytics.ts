import { trackEvent } from '../api/telemetry'
import { isInstalledPwa } from './appUtils'
import { imageCount } from './db'

interface TrackSessionType {
  event: string
  userType: string
  totalImages?: number
  PWA_APP?: boolean
}

export const trackNewSession = async () => {
  if (!document.hasFocus()) {
    return
  }

  let userType = 'NEW_USER'
  if (
    localStorage.getItem('allowNsfwImages') ||
    localStorage.getItem('orientation')
  ) {
    userType = 'RETURNING_USER'
  }
  const data: TrackSessionType = {
    event: 'NEW_SESSION',
    userType
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
