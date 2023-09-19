import AppSettings from 'app/_data-models/AppSettings'

interface PrimaryWindow {
  uuid: string
  timestamp: number
}

let uuid: string
let isPrimaryWindow = false

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const pageIsPrimaryWindow = () => {
  return isPrimaryWindow
}

export const pageHasFocus = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    return true

  return document.hasFocus()
}

export const pageIsVisible = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    return true

  const visibilityChangeProperty =
    'hidden' in document
      ? 'visibilityState'
      : 'webkitHidden' in document
      ? 'webkitVisibilityState'
      : null

  if (!visibilityChangeProperty) {
    // Page Visibility API is not supported in this browser.
    return true // Assume the page is active.
  }

  // @ts-ignore
  return document[visibilityChangeProperty] === 'visible'
}

export const initializePrimaryWindowOnLoad = () => {
  // Step 1: Create or retrieve the UUID from local storage
  if (!uuid) {
    uuid = generateUUID()
  }

  // Step 2: Check and store the object in localStorage
  // @ts-ignore
  let primaryWindow: PrimaryWindow = localStorage.getItem('PrimaryWindow')
  if (!primaryWindow) {
    // @ts-ignore
    primaryWindow = {
      uuid,
      timestamp: Date.now()
    }
    localStorage.setItem('PrimaryWindow', JSON.stringify(primaryWindow))
    isPrimaryWindow = true
  }

  // Step 3: Update timestamp every 2.5 seconds
  setInterval(() => {
    primaryWindow =
      JSON.parse(localStorage.getItem('PrimaryWindow') as string) || {}

    if (primaryWindow && primaryWindow.uuid !== uuid && pageHasFocus()) {
      primaryWindow.uuid = uuid
      primaryWindow.timestamp = Date.now()
      localStorage.setItem('PrimaryWindow', JSON.stringify(primaryWindow))
      isPrimaryWindow = true
      return
    }

    const canUpdate =
      pageIsVisible() || AppSettings.get('runInBackground') !== false

    if (primaryWindow.uuid === uuid && canUpdate) {
      primaryWindow.timestamp = Date.now()
      localStorage.setItem('PrimaryWindow', JSON.stringify(primaryWindow))
      isPrimaryWindow = true
    } else {
      isPrimaryWindow = false
    }
  }, 2500)

  // Step 4: Update the timestamp if it's been more than 10 seconds
  setInterval(() => {
    // @ts-ignore
    primaryWindow = JSON.parse(localStorage.getItem('PrimaryWindow'))
    const currentTime = Date.now()
    if (
      primaryWindow.timestamp + 5000 <= currentTime &&
      primaryWindow.uuid !== uuid
    ) {
      primaryWindow.uuid = uuid
      primaryWindow.timestamp = currentTime
      localStorage.setItem('PrimaryWindow', JSON.stringify(primaryWindow))
      isPrimaryWindow = true
    }
  }, 1000)
}
