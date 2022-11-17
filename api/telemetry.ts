interface Params {
  action: string
  params: any
}

export const trackGaEvent = ({ action, params }: Params) => {
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
  // const { event } = obj

  // if (event === 'FEEDBACK_FORM') {
  //   //@ts-ignore
  //   if (!obj.input || obj?.input.trim().length < 10) {
  //     return
  //   }
  // }

  try {
    await fetch(`/artbot/api/telemetry`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } finally {
    // If nothing happens, it's fine to ignore this.
  }
}
