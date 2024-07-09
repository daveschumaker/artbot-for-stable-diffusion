import { basePath } from 'BASE_PATH'
import AppSettings from 'app/_data-models/AppSettings'
import { logToConsole } from 'app/_utils/debugTools'

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

  if (typeof window === 'undefined') {
    return
  }

  if (useBeta || useBeta === 'userTrue') {
    if (!obj.data) {
      obj.data = {}
    }

    obj.data = { ...obj.data, useBeta }
  }

  // Add artbot_uuid for debugging flow
  obj.data = { ...obj.data, artbot_uuid: AppSettings.get('artbot_uuid') }
  logToConsole({ data: obj, name: 'Telemetry', debugKey: 'DEBUG_TELEMETRY' })

  // if (
  //   obj.event !== 'IMAGE_RECEIVED_FROM_API' &&
  //   typeof window !== 'undefined' &&
  //   window.location.host.indexOf('localhost') >= 0
  // ) {
  //   return
  // }

  // @ts-ignore
  // const { event } = obj

  // if (event === 'FEEDBACK_FORM') {
  //   //@ts-ignore
  //   if (!obj.input || obj?.input.trim().length < 10) {
  //     return
  //   }
  // }

  // Only track new image counts
  if (
    obj.event === 'IMAGE_RECEIVED_FROM_API' ||
    obj.event === 'FEEDBACK_FORM'
  ) {
    try {
      await fetch(`${basePath}/api/telemetry`, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      // If nothing happens, it's fine to ignore this.
    } finally {
      return {
        success: true
      }
    }
  }
}
