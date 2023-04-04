import { makeStore } from 'statery'
import { IClusterSettings } from './clusterSettings'

interface AppStore {
  buildId: string
  clusterSettings: IClusterSettings
  hordePerformance: object
  indexDbSupport: boolean
  newImageReady: string
  primaryWindow: boolean
  serverMessage: string
  showAppMenu: boolean
  showBetaOption: boolean
  showImageReadyToast: boolean
  stableHordeApiOnline: boolean
  storageQuotaLimit: boolean
  unsupportedBrowser: boolean
}

export const appInfoStore = makeStore<AppStore>({
  buildId: '',
  clusterSettings: {
    forceReloadOnServerUpdate: true
  },
  hordePerformance: {},
  indexDbSupport: true,
  newImageReady: '',
  serverMessage: '',
  showAppMenu: false,
  showBetaOption: false,
  showImageReadyToast: false,
  stableHordeApiOnline: true,
  storageQuotaLimit: false,
  unsupportedBrowser: false,
  primaryWindow: false
})

export const setStorageQuotaLimit = (val: boolean = false) => {
  appInfoStore.set(() => ({
    storageQuotaLimit: val
  }))
}

export const setClusterSettings = (obj: IClusterSettings) => {
  appInfoStore.set(() => ({
    clusterSettings: obj
  }))
}

export const setHordePerformance = (obj: object) => {
  appInfoStore.set(() => ({
    hordePerformance: obj
  }))
}

export const setUnsupportedBrowser = (val: boolean = false) => {
  appInfoStore.set(() => ({
    unsupportedBrowser: val
  }))
}

export const setPrimaryWindow = (val: boolean = false) => {
  appInfoStore.set(() => ({
    primaryWindow: val
  }))
}

export const setShowAppMenu = (val: boolean = false) => {
  appInfoStore.set(() => ({
    showAppMenu: val
  }))
}

export const setShowBetaOption = (val: boolean) => {
  appInfoStore.set(() => ({
    showBetaOption: val
  }))
}

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
  }))
}

export const setHordeStatus = (val: boolean) => {
  appInfoStore.set(() => ({
    stableHordeApiOnline: val
  }))
}

export const setServerMessage = (message: string) => {
  if (appInfoStore.state.serverMessage === message) {
    return
  }

  appInfoStore.set(() => ({
    serverMessage: message
  }))
}

export const setIndexDbSupport = (bool: boolean) => {
  appInfoStore.set(() => ({
    indexDbSupport: bool
  }))
}

export const setShowImageReadyToast = (bool: boolean) => {
  if (appInfoStore.state.showImageReadyToast === bool) {
    return
  }

  appInfoStore.set(() => ({
    showImageReadyToast: bool
  }))
}

export const setNewImageReady = (jobId: string) => {
  // Attempt to prevent race condition when PendingItems component
  // tries to update the toast. For some reason, it's not
  // getting the correct state.

  if (jobId && appInfoStore.state.showImageReadyToast) {
    return
  }

  appInfoStore.set(() => ({
    newImageReady: jobId,
    showImageReadyToast: jobId ? true : false
  }))
}
