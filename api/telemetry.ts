export const trackEvent = (obj = {}) => {
  fetch(`/artbot/api/telemetry`, {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
