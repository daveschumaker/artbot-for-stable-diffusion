import { makeStore } from 'statery'

interface AppStore {
  buildId: string
  indexDbSupport: boolean
  serverMessage: string
  newImageReady: string
  showImageReadyToast: boolean
}

export const appInfoStore = makeStore<AppStore>({
  buildId: '',
  indexDbSupport: true,
  serverMessage: '',
  newImageReady: '',
  showImageReadyToast: false
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
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
