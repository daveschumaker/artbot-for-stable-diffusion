import AppSettings from 'app/_data-models/AppSettings'

interface DocumentWithWebkitVisibility extends Document {
  webkitVisibilityState?: Document['visibilityState']
}

interface PrimaryWindow {
  uuid: string
  timestamp: number
}

const PRIMARY_WINDOW_KEY = 'PrimaryWindow'

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

  return (
    (document as DocumentWithWebkitVisibility)[visibilityChangeProperty] ===
    'visible'
  )
}

// Another tab, a settings reset or the user can remove or overwrite the key.
// Anything that isn't a valid entry counts as no primary window.
const readPrimaryWindow = (): PrimaryWindow | null => {
  try {
    const value = JSON.parse(localStorage.getItem(PRIMARY_WINDOW_KEY) ?? '')

    if (
      value &&
      typeof value.uuid === 'string' &&
      typeof value.timestamp === 'number'
    ) {
      return value
    }
  } catch (err) {}

  return null
}

const claimPrimaryWindow = () => {
  const primaryWindow: PrimaryWindow = { uuid, timestamp: Date.now() }
  localStorage.setItem(PRIMARY_WINDOW_KEY, JSON.stringify(primaryWindow))
  isPrimaryWindow = true
}

export const initializePrimaryWindowOnLoad = () => {
  if (!uuid) {
    uuid = generateUUID()
  }

  if (!readPrimaryWindow()) {
    claimPrimaryWindow()
  }

  // Every 2.5 seconds, a focused tab takes over, and the primary tab keeps its
  // claim fresh while it's allowed to run.
  setInterval(() => {
    const primaryWindow = readPrimaryWindow()

    if (!primaryWindow || (primaryWindow.uuid !== uuid && pageHasFocus())) {
      claimPrimaryWindow()
      return
    }

    const canUpdate =
      pageIsVisible() || AppSettings.get('runInBackground') !== false

    if (primaryWindow.uuid === uuid && canUpdate) {
      claimPrimaryWindow()
    } else {
      isPrimaryWindow = false
    }
  }, 2500)

  // Every second, take over from a primary tab that stopped updating its claim
  // more than 5 seconds ago.
  setInterval(() => {
    const primaryWindow = readPrimaryWindow()

    if (
      !primaryWindow ||
      (primaryWindow.uuid !== uuid &&
        primaryWindow.timestamp + 5000 <= Date.now())
    ) {
      claimPrimaryWindow()
    }
  }, 1000)
}
