import { basePath } from 'BASE_PATH'
import { HORDE_DEV, HORDE_PROD } from '_constants'
import AppSettings from 'app/_data-models/AppSettings'
import {
  pageHasFocus,
  pageIsPrimaryWindow,
  pageIsVisible
} from './primaryWindow'

export const logError = async (data: any) => {
  await fetch(`${basePath}/api/log-error`, {
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

  // Browser doesn't support document.hidden or visibility state?
  // Then always run in background
  if (typeof document.hidden === 'undefined') {
    return true
  }

  // Web app is always active if the page has focus.
  if (pageHasFocus()) return true

  // All of these rules require a single primary window to be set and active.
  if (!pageIsPrimaryWindow()) return false

  // Page behind another window but still visible. e.g., multitasking.
  if (AppSettings.get('runInBackground') === false && pageIsVisible()) {
    return true
  }

  // User hasn't explicitly disabled "runInBackground"
  if (AppSettings.get('runInBackground') !== false) {
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

export function generateRandomString(length: number = 6) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters[randomIndex]
  }

  return randomString
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

export const formatDate = () => {
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const hours = String(currentDate.getHours()).padStart(2, '0')
  const minutes = String(currentDate.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day}_${hours}:${minutes}`
}

export const parseQueryString = (
  queryString: string
): {
  [key: string]: string | boolean
} => {
  if (!queryString) return {}

  const params = new URLSearchParams(queryString)
  const result: { [key: string]: string | boolean } = {}

  for (const [key, value] of params.entries()) {
    if (value === 'true') {
      result[key] = true
    } else if (value === 'false') {
      result[key] = false
    } else {
      result[key] = value
    }
  }

  return result
}

export const debounce = (
  func: (str: string) => Promise<any>,
  delay: number
) => {
  let timerId: any

  return (...args: any) => {
    clearTimeout(timerId)
    return new Promise((resolve) => {
      timerId = setTimeout(() => {
        resolve(func.apply(null, args))
      }, delay)
    })
  }
}
