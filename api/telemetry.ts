export const trackEvent = async (obj = {}) => {
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
