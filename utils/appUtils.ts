import { BroadcastChannel } from 'broadcast-channel'
import { HORDE_DEV, HORDE_PROD } from '../_constants'
import AppSettings from '../models/AppSettings'
import { appInfoStore, setPrimaryWindow } from 'store/appStore'

export const logError = async (data: any) => {
  await fetch(`/artbot/api/log-error`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const clientHeader = () => {
  return `ArtBot:v.1:(discord)rockbandit#4910`
}

export const isAppActive = () => {
  if (typeof window === 'undefined') {
    return true
  }

  if (appInfoStore.state.primaryWindow) {
    return true
  }

  // Browser doesn't support document.hidden or visibility state?
  // Then always run in background
  if (typeof document.hidden === 'undefined') {
    return true
  }

  // User defined runInBackground is false
  // if (AppSettings.get('runInBackground') === false && document.hidden) {
  //   return false;
  // }

  // Either user defined runInBackground explicitly set to true
  // (or new user -- where runInBackground will be undefined)
  if (AppSettings.get('runInBackground') !== false) {
    return true
  }

  if (document.visibilityState === 'visible') {
    return true
  }

  return false
}

export const isInstalledPwa = () => {
  if (typeof window === 'undefined') {
    return false
  }

  // @ts-ignore
  if (window?.navigator?.standalone) {
    // Installed on iOS
    return true
  } else if (window?.matchMedia('(display-mode: standalone)')?.matches) {
    // Installed on Android
    return true
  }

  return false
}

// Simple UUID generator for ArtBot's own purposes (tracking groups of images generated at once)
// Since this will only be used for lookup's on a user's own device, it's safe to use.
// Do not seriously use it in any sort of mission critical production environment.
// https://stackoverflow.com/a/2117523
export function uuidv4() {
  //@ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
}

export function isUuid(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export const getApiHostServer = () => {
  if (AppSettings.get('useBeta') || AppSettings.get('useBeta') === 'userTrue') {
    return HORDE_DEV
  }

  return HORDE_PROD
}

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

///////
export const isSafariBrowser = () => {
  const is_chrome = navigator.userAgent.indexOf('Chrome') > -1
  const is_safari = navigator.userAgent.indexOf('Safari') > -1

  if (is_safari) {
    if (is_chrome)
      // Chrome seems to have both Chrome and Safari userAgents
      return false
    else return true
  }
  return false
}

export const isiOS = () => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator?.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export const enterFullScreen = (element: any) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen() // Firefox
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen() // Safari
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen() // IE/Edge
  }
}

export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
    // @ts-ignore
  } else if (document.mozCancelFullScreen) {
    // @ts-ignore
    document.mozCancelFullScreen()
    // @ts-ignore
  } else if (document.webkitExitFullscreen) {
    // @ts-ignore
    document.webkitExitFullscreen()
  }
}

let primaryTab = false
let channel: any
let windowUuid: string

const setActive = () => {
  if (primaryTab === true) {
    return
  }

  primaryTab = true
  let msg = {
    windowId: windowUuid,
    msg: 'active'
  }

  setPrimaryWindow(true)
  channel.postMessage(msg)
}

/**
 * BroadcastChannel
 * This library has a leaderElection method for helping to determine
 * the primary tab for a web app. However, I couldn't get this to work
 * so I implemented my own leader election system here, using event listeners
 * and a unique window ID.
 */
export const initBrowserTab = () => {
  if (typeof window === 'undefined') {
    return
  }

  document?.querySelector('body')?.addEventListener('mouseover', setActive)
  document?.querySelector('body')?.addEventListener('keydown', setActive)
  window.addEventListener('scroll', setActive)

  windowUuid = uuidv4()
  channel = new BroadcastChannel('activeTab')
  channel.onmessage = (msg: any) => {
    if (msg.windowId !== windowUuid) {
      primaryTab = false
      setPrimaryWindow(false)
    }
  }
}

export const formatDate = () => {
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const hours = String(currentDate.getHours()).padStart(2, '0')
  const minutes = String(currentDate.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day}_${hours}:${minutes}`
}

// Function to handle visibility change events
export const documentIsVisible = () => {
  if (document.hidden) {
    return false
  } else {
    return true
  }
}

// export const broadcastMessage = (msg: string) => {
//   if (!channel) {
//     return
//   }

//   channel.postMessage(msg)
// }
