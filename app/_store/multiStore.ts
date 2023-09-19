import { makeStore } from 'statery'

export enum WindowState {
  main,
  sub
}
interface MultiStore {
  windowState: WindowState
  lastPingTime: number
  otherAvailablePagesFound: boolean
}

export function ping(): boolean {
  if (multiStore.state.windowState == WindowState.main) {
    localStorage[LocalStorageEvents.Ping] = Date.now()
    return true
  }
  return false
}

export enum LocalStorageEvents {
  New = 'new',
  Available = 'available',
  Ping = 'ping'
}

// wait a random timeout to set main
export function decideNewMain() {
  setTimeout(() => {
    if (
      pingChecker != null &&
      Date.now() - multiStore.state.lastPingTime > 2000
    ) {
      // we still have no ping, so we are the main window
      //console.log('we are the main window')
      multiStore.set(() => ({
        windowState: WindowState.main
      }))
      clearInterval(pingChecker)
      //announce ourselves
      ping()
      enablePingSender()
    }
  }, Math.random() * 1000)
}

let pingSender: any | null
let pingChecker: any | null
export const enablePingChecker = () => {
  if (!pingChecker == null) {
    return
  }
  pingChecker = setInterval(() => {
    if (isMainWindow()) {
      clearInterval(pingChecker)
      return
    }
    if (Date.now() - multiStore.state.lastPingTime > 1500) {
      decideNewMain()
    }
  }, 1000)
}

export const enablePingSender = () => {
  if (pingSender == null) {
    pingSender = setInterval(() => {
      if (!ping()) {
        console.error('Trying to send ping while not being the main window')
      }
    }, 1000)
  }
}

export const onLocalStorageEvent = (e: { key: any }) => {
  switch (e.key) {
    case LocalStorageEvents.New:
      // a new window has been opened, sent answer that a page already exists
      if (multiStore.state.windowState == WindowState.main) {
        localStorage[LocalStorageEvents.Available] = Date.now()
      }

      break
    case LocalStorageEvents.Available:
      // a different main tab with ArtBot exists already
      multiStore.set(() => ({
        otherAvailablePagesFound: true
      }))
      break
    case LocalStorageEvents.Ping:
      multiStore.set(() => ({ lastPingTime: parseInt(localStorage.ping) }))
      break

    default:
      break
  }
  //console.log(e.key)
}

// default to sub window state, so that subWindows don't fire off requests at page load
export const multiStore = makeStore<MultiStore>({
  windowState: WindowState.sub,
  lastPingTime: Date.now(),
  otherAvailablePagesFound: false
})

export const isMainWindow = () => {
  return multiStore.state.windowState == WindowState.main
}

export const setWindowState = (state: WindowState) => {
  multiStore.set(() => ({
    windowState: state
  }))
}
