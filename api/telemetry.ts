// @ts-ignore
export const trackGaEvent = ({ action, params }) => {
  // @ts-ignore
  window.gtag('event', action, params)
}

export const trackEvent = async (obj = {}) => {
  if (
    typeof window !== 'undefined' &&
    window.location.host.indexOf('localhost') >= 0
  ) {
    return
  }

  // @ts-ignore
  const { event } = obj

  if (event === 'FEEDBACK_FORM') {
    //@ts-ignore
    if (isNaN(obj.totalImages) || obj.totalImages === 0) {
      return
    }

    //@ts-ignore
    if (!obj.input || obj?.input.trim().length < 10) {
      return
    }
  }

  try {
    await fetch(`/artbot/api/telemetry`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    // If nothing happens, it's fine to ignore this.
  }
}
