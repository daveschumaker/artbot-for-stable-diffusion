import { makeStore } from 'statery'

interface AppStore {
  adEventTimestamp: number
  buildId: string
  clusterSettings: {
    forceReloadOnServerUpdate: boolean
  }
  forceSelectedWorker: boolean
  hordePerformance: object
  indexDbSupport: boolean
  imageDetailsModalOpen: boolean
  newImageReady: string
  notification: {
    title: string
    content: string
    timestamp: number
  }
  serverMessage: {
    content: string
    title: string
    type: string
  }
  showAppMenu: boolean
  showBetaOption: boolean
  showImageReadyToast: boolean
  stableHordeApiOnline: boolean
  storageQuotaLimit: boolean
  unsupportedBrowser: boolean
  useAllowedWorkers: boolean
  useBlockedWorkers: boolean
  pauseJobQueue: boolean
}

export const appInfoStore = makeStore<AppStore>({
  adEventTimestamp: 0,
  buildId: '',
  clusterSettings: {
    forceReloadOnServerUpdate: true
  },
  forceSelectedWorker: false,
  hordePerformance: {},
  indexDbSupport: true,
  imageDetailsModalOpen: false,
  newImageReady: '',
  notification: {
    title: '',
    content: '',
    timestamp: 0
  },
  serverMessage: {
    content: '',
    title: '',
    type: ''
  },
  showAppMenu: false,
  showBetaOption: false,
  showImageReadyToast: false,
  stableHordeApiOnline: true,
  storageQuotaLimit: false,
  unsupportedBrowser: false,
  useAllowedWorkers: false,
  useBlockedWorkers: false,
  pauseJobQueue: false
})

export const setPauseJobQueue = (val: boolean) => {
  appInfoStore.set(() => ({
    pauseJobQueue: val
  }))
}

export const setUseAllowedWorkers = (val: boolean) => {
  appInfoStore.set(() => ({
    useAllowedWorkers: val
  }))
}

export const setUseBlockedWorkers = (val: boolean) => {
  appInfoStore.set(() => ({
    useBlockedWorkers: val
  }))
}

export const setForceSelectedWorker = (val: boolean) => {
  appInfoStore.set(() => ({
    forceSelectedWorker: val
  }))
}

export const updateAdEventTimestamp = () => {
  appInfoStore.set(() => ({
    adEventTimestamp: Date.now()
  }))
}

export const setStorageQuotaLimit = (val: boolean = false) => {
  appInfoStore.set(() => ({
    storageQuotaLimit: val
  }))
}

export const setImageDetailsModalOpen = (val: boolean = false) => {
  appInfoStore.set(() => ({
    imageDetailsModalOpen: val
  }))
}

export const setClusterSettings = (obj: any) => {
  appInfoStore.set(() => ({
    clusterSettings: obj
  }))
}

export const setServerMessage = (obj: any) => {
  appInfoStore.set(() => ({
    serverMessage: { ...obj }
  }))
}

export const setNotification = (obj: any) => {
  // Prevent un-neccesary rerenders. This might not be needed?
  if (
    obj.title === appInfoStore.state.notification.title &&
    obj.content === appInfoStore.state.notification.content
  ) {
    return
  }

  appInfoStore.set(() => ({
    notification: { ...obj }
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
