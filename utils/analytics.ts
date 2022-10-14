import { trackEvent } from '../api/telemetry'
import { imageCount } from './db'

export const trackNewSession = async () => {
  let userType = 'NEW_USER'
  if (
    localStorage.getItem('allowNsfwImages') ||
    localStorage.getItem('orientation')
  ) {
    userType = 'RETURNING_USER'
  }
  const data = {
    event: 'NEW_SESSION',
    userType
  }

  if (userType === 'RETURNING_USER') {
    let totalImages = await imageCount()

    // @ts-ignore
    data.totalImages = totalImages
  }

  trackEvent(data)
}
