import AppSettings from '../models/AppSettings'
import serverFetchWithTimeout from '../utils/serverFetchWithTimeout'

interface Params {
  action: string
  params: any
}

export const trackGaEvent = ({ action, params }: Params) => {
  if (typeof window === 'undefined') {
    return
  }

  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('event', action, params)
  }
}

export const trackEvent = async (obj: any = {}) => {
  const useBeta = AppSettings.get('useBeta')

  if (useBeta || useBeta === 'userTrue') {
    if (!obj.data) {
      obj.data = {}
    }

    obj.data = { ...obj.data, useBeta }
  }

  if (
    typeof window !== 'undefined' &&
    window.location.host.indexOf('localhost') >= 0
  ) {
    return
  }

  // Add artbot_uuid for debugging flow
  obj.data = { ...obj.data, artbot_uuid: AppSettings.get('artbot_uuid') }

  // @ts-ignore
  // const { event } = obj

  // if (event === 'FEEDBACK_FORM') {
  //   //@ts-ignore
  //   if (!obj.input || obj?.input.trim().length < 10) {
  //     return
  //   }
  // }

  try {
    serverFetchWithTimeout(`/artbot/api/telemetry`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 1500
    })
  } catch (err) {
    // If nothing happens, it's fine to ignore this.
  } finally {
    return {
      success: true
    }
  }
}
