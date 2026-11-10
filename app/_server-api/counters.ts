require('dotenv').config()

// Prioritize ARTBOT_STATUS_API if available, fall back to STATUS_API
const statusApi = process.env.ARTBOT_STATUS_API || process.env.STATUS_API

// Counts a finished image. The status API keeps the running total that
// /api/status/counter/images reports.
export const updateImageCount = () => {
  if (!statusApi) return

  fetch(`${statusApi}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'image',
      service: 'ArtBot_v1'
    })
  }).catch(() => {
    // Ignore any errors
  })
}
